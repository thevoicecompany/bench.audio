import { type Model, ConvoType } from "@prisma/client";
import Retell from "retell-sdk";
import { z } from "zod";
import { type PromptFunction } from "~/prompts/promptSchema";
import { zpp } from "@cryop/zpp";

import { Ok, Err } from "ts-results";
import { type StartCall, type ConvoADT } from "~/lib/types";
import { env } from "~/env";

const ttsSchema = zpp(
  z.object({
    voiceId: z.string(),
    provider: z.enum(["elevenlabs", "openai", "deepgram"]),
    sample_rate: z.number().optional(),
  }),
);

const modelSchema = zpp(
  z.object({
    model: z.enum(["gpt-3.5-turbo", "gpt-4-turbo"]),
  }),
);

const getCallConfig = (
  convo: ConvoADT,
  ttsProvider: string,
  sampleRate?: number,
) => {
  if (convo.type === ConvoType.Phone) return ["twilio", "mulaw", 8000] as const;

  switch (ttsProvider) {
    case "elevenlabs":
      return ["web", "s16le", sampleRate ?? 44100] as const;
    case "openai":
      return ["web", "s16le", 24000] as const;
    case "deepgram":
      return ["web", "s16le", sampleRate ?? 32000] as const;
    default:
      throw new Error(`Unsupported TTS provider: ${ttsProvider}`);
  }
};

const createCall = async (
  convo: ConvoADT,
  promptFn: PromptFunction,
  model: Model,
): Promise<StartCall<Retell.Call.RegisterCallResponse>> => {
  const retellClient = new Retell({
    // apiKey: "your-api-key-here",
    apiKey: env.RETELL_API_KEY,
  });

  const ttsConfig = ttsSchema.jsonParseSafe(model.ttsConfig);

  if (!ttsConfig.success) return Err("Invalid TTS config");

  const modelConfig = modelSchema.jsonParseSafe(model.llmConfig);

  if (!modelConfig.success) return Err("Invalid LLM config");

  const prompt = promptFn(convo.length);

  const llm = await retellClient.llm.create({
    general_prompt: prompt.generalPrompt,
    begin_message: prompt.beginMsg,
    general_tools: [
      {
        type: "end_call",
        name: "end_call",
        description: prompt.endInstructions,
      },
    ],

    model: modelConfig.data.model,
  });

  const agent = await retellClient.agent.create({
    llm_websocket_url: llm.llm_websocket_url,
    voice_id: ttsConfig.data.voiceId,
    agent_name: prompt.agentName,
    enable_backchannel: prompt.backChannel,
  });

  const [protocol, encoding, sampleRate] = getCallConfig(
    convo,
    ttsConfig.data.provider,
    ttsConfig.data.sample_rate,
  );

  if (convo.type === ConvoType.Phone) {
    const registerCallResponse = await retellClient.call.register({
      agent_id: agent.agent_id,
      audio_encoding: encoding,
      audio_websocket_protocol: protocol,
      sample_rate: sampleRate,
      to_number: convo.phoneNumber,
    });

    return Ok({ type: ConvoType.Phone, details: registerCallResponse });
  } else {
    const registerCallResponse = await retellClient.call.register({
      agent_id: agent.agent_id,
      audio_encoding: encoding,
      audio_websocket_protocol: protocol,
      sample_rate: sampleRate,
    });

    const startClientCall = async () => {
      // import { RetellWebClient } from "retell-client-js-sdk";
      const RetellWebClient = (await import("retell-client-js-sdk"))
        .RetellWebClient;

      const sdk = new RetellWebClient();

      await sdk.startConversation({
        callId: registerCallResponse.call_id,
        sampleRate: registerCallResponse.sample_rate,
        enableUpdate: true, // (Optional) You want to receive the update event such as transcript
      });

      return sdk;
    };

    return Ok({
      type: ConvoType.Online,
      details: registerCallResponse,
      startClientCall,
    });
  }
};

export const retell = {
  createCall,
  schemas: {
    modelSchema,
    ttsSchema,
  },
};
