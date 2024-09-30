import { createTRPCRouter, publicProcedure } from "../trpc";

export const modelRouter = createTRPCRouter({
  allModels: publicProcedure.query(async ({ ctx }) => {
    const models = await ctx.db.model.findMany({
      select: { label: true, provider: true, id: true, elo: true },
      orderBy: { elo: { score: "desc" } },
    });

    return models;
  }),
});
