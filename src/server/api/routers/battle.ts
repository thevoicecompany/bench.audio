import { z } from "zod";

import { ConvoLength, ConvoType, Outcome } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { OnlineConvo, PhoneConvo } from "~/lib/types";
import { prompts } from "~/prompts/promptSchema";
import { switchCreateCall } from "~/providers/lib/commonServer";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const battleRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        type: z.enum(["Online", "Phone"]),
        length: z.enum(["short", "medium", "unbounded"]),
        phoneNumber: z.string().optional(),
        fingerprint: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      // Pick two models

      const user = await ctx.db.user.upsert({
        where: { uuid: input.fingerprint },
        update: { fingerprint: input.fingerprint },
        create: { uuid: input.fingerprint, fingerprint: input.fingerprint },
      });

      const models = await ctx.db.model.findMany({
        include: { battlesA: true, battlesB: true, elo: true },
      });

      const battleCount = models.map(
        (m) => m.battlesA.length + m.battlesB.length,
      );

      // Calculate the probability weights based on Elo rating and battle count
      const weights = models.map((model, index) => {
        const eloWeight =
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          1 / (1 + Math.exp((1500 - (model.elo?.score || 1500)) / 400));
        const battleCountWeight = 1 / (1 + battleCount[index]!);
        return eloWeight * 0.7 + battleCountWeight * 0.3;
      });

      // Normalize the weights to sum up to 1
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      const normalizedWeights = weights.map((weight) => weight / totalWeight);

      // Select the first model based on the probability weights
      const randomValue1 = Math.random();
      let cumulativeWeight = 0;
      let selectedModel1Index = 0;
      for (let i = 0; i < normalizedWeights.length; i++) {
        cumulativeWeight += normalizedWeights[i]!;
        if (randomValue1 <= cumulativeWeight) {
          selectedModel1Index = i;
          break;
        }
      }

      // Select the second model based on the probability weights, excluding the first selected model
      const remainingWeights = [...normalizedWeights];
      remainingWeights[selectedModel1Index] = 0;
      const totalRemainingWeight = remainingWeights.reduce(
        (sum, weight) => sum + weight,
        0,
      );
      const normalizedRemainingWeights = remainingWeights.map(
        (weight) => weight / totalRemainingWeight,
      );

      let randomValue2;
      let selectedModel2Index;
      do {
        randomValue2 = Math.random();
        cumulativeWeight = 0;
        selectedModel2Index = 0;
        for (let i = 0; i < normalizedRemainingWeights.length; i++) {
          cumulativeWeight += normalizedRemainingWeights[i]!;
          if (randomValue2 <= cumulativeWeight) {
            selectedModel2Index = i;
            break;
          }
        }
      } while (selectedModel2Index === selectedModel1Index);

      const modelA = models[selectedModel1Index];
      const modelB = models[selectedModel2Index];

      if (!modelA || !modelB) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid model selection",
        });
      }

      const type: ConvoType =
        input.type === "Phone" ? ConvoType.Phone : ConvoType.Online;
      const length: ConvoLength =
        input.length === "short"
          ? ConvoLength.Short
          : input.length === "medium"
            ? ConvoLength.Medium
            : ConvoLength.Unbounded;

      const battle = await ctx.db.battle.create({
        data: {
          user: {
            connect: { uuid: user.uuid },
          },
          modelA: {
            connect: { id: modelA.id },
          },
          modelB: {
            connect: { id: modelB.id },
          },
          convoA: {
            create: {},
          },
          convoB: {
            create: {},
          },
          convoType: type,
          convoLength: length,
          state: "Idle",
        },
      });

      return {
        battle,
        modelA,
        modelB,
      };
    }),

  prepareModel: publicProcedure
    .input(
      z.object({
        modelId: z.string(),
        battleId: z.string(),
        phoneNumber: z.string().optional(),
        convoIndex: z.enum(["A", "B"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const model = await ctx.db.model.findUnique({
        where: { id: input.modelId },
      });

      if (!model) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid model selection",
        });
      }

      const battle = await ctx.db.battle.findUnique({
        where: { id: input.battleId },
        include: {
          convoA: input.convoIndex === "A",
          convoB: input.convoIndex === "B",
        },
      });

      if (!battle) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid battle selection",
        });
      }

      const conversationId = battle?.convoA?.id ?? battle?.convoB?.id;

      if (!conversationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid conversation selection",
        });
      }

      const convo =
        battle.convoType === "Online"
          ? OnlineConvo(battle.convoLength)
          : PhoneConvo(battle.convoLength, input.phoneNumber);

      console.log(model?.provider);

      const callDetails = await switchCreateCall(convo, prompts.friend, model);

      if (!callDetails.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `${callDetails.val}`,
        });
      }

      return {
        provider: model.provider,
        convo,
        details: callDetails.val.details,
        conversationId,
      };
    }),

  vote: publicProcedure
    .input(
      z.object({
        battleId: z.string(),
        vote: z.enum(["A", "B", "tie", "tieBothBad"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.battle.update({
        where: { id: input.battleId },
        data: {
          outcome:
            input.vote == "A"
              ? Outcome.WinA
              : input.vote == "B"
                ? Outcome.WinB
                : input.vote == "tie"
                  ? Outcome.Tie
                  : Outcome.TieBothBad,
        },
      });
    }),
});
