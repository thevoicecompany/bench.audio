/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { Model } from "@prisma/client";
import type { Assistant } from "@vapi-ai/web/dist/api";
import type { ConvoADT, StartCall } from "~/lib/types";
import type { PromptFunction } from "~/prompts/promptSchema";

import { Err, Ok } from "ts-results";
import { z } from "zod";

import { zpp } from "@cryop/zpp";
import { ConvoType } from "@prisma/client";

import { createProvider } from "~/providers/lib/providerSchema";

const transcriberSchema = zpp(
  z.object({
    provider: z.enum(["deepgram", "talkscriber"]),
    model: z.string(),
    language: z.string().optional().default("en"),
  }),
);

const modelSchema = zpp(
  z.object({
    provider: z.enum([
      "openai",
      "together-ai",
      "anyscale",
      "openrouter",
      "perplexity-ai",
      "deepinfra",
      "groq",
      "anthropic",
      "custom-1lm",
    ]),
    model: z.string(),
    temperature: z.coerce.number().optional(),
  }),
);

const ttsSchema = zpp(
  z.object({
    provider: z.enum([
      "azure",
      "11labs",
      "playht",
      "rime-ai",
      "deepgram",
      "openai",
      "lmnt",
      "neets",
    ]),
    voiceId: z.string(),
  }),
);

const createCall = async (
  convo: ConvoADT,
  promptFn: PromptFunction,
  model: Model,
): Promise<StartCall<Assistant>> => {
  const { env } = await import("~/env");
  const prompt = promptFn(convo.length);

  const transcriberConfig = transcriberSchema.jsonParseSafe(model.asrConfig);

  if (!transcriberConfig.success)
    return Err(`Invalid TTS config: ${transcriberConfig.error.message}`);

  const modelConfig = modelSchema.jsonParseSafe(model.llmConfig);

  if (!modelConfig.success)
    return Err(`Invalid model config: ${modelConfig.error.message}`);

  const voiceConfig = ttsSchema.jsonParseSafe(model.ttsConfig);

  if (!voiceConfig.success)
    return Err(`Invalid voice config: ${voiceConfig.error.message}`);

  const assistant: Assistant = {
    transcriber: {
      // @ts-expect-error
      provider: transcriberConfig.data.provider,
      model: transcriberConfig.data.model,
      // @ts-expect-error
      language: transcriberConfig.data.language,
    },
    model: {
      // @ts-expect-error
      provider: modelConfig.data.provider,
      model: modelConfig.data.model,
      temperature: modelConfig.data.temperature,
      messages: [
        {
          content: prompt.generalPrompt,
          role: "system",
        },
      ],
    },
    voice: {
      // @ts-expect-error
      provider: voiceConfig.data.provider,
      voiceId: voiceConfig.data.voiceId,
    },
    recordingEnabled: true,
    endCallFunctionEnabled: true,
    clientMessages: [
      "transcript",
      "hang",
      "function-call",
      "speech-update",
      "metadata",
      "conversation-update",
    ],
    serverMessages: [
      "end-of-call-report",
      "status-update",
      "hang",
      "function-call",
    ],
    firstMessage: prompt.beginMsg,
    backchannelingEnabled: prompt.backChannel,
  };

  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(assistant),
  };

  const response = await fetch("https://api.vapi.ai/assistant", options);

  const data: Assistant = await response.json();

  if (convo.type === ConvoType.Phone) {
    return Ok({ type: ConvoType.Phone, details: data });
  }

  return Ok({ type: ConvoType.Online, details: data });
};

export const vapi = createProvider("Vapi", createCall, {
  modelSchema,
  ttsSchema,
  transcriberSchema,
});

export type VapiProvider = typeof vapi;
