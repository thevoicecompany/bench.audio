import { ConvoLength } from "@prisma/client";
import { friendPrompt } from "./prompts/friend";

export type PromptSchema = {
  generalPrompt: string;
  beginMsg: string;
  endInstructions: string;
  agentName?: string;
  backChannel?: boolean;
};

export type PromptFunction = (convoLength: ConvoLength) => PromptSchema;

export const appendTimeToGeneralPrompt = (
  convoLength: ConvoLength,
  string: string,
) => {
  switch (convoLength) {
    case ConvoLength.Short:
      return `${string}. Keep the conversation short and snappy under a minute.`;
    case ConvoLength.Medium:
      return `${string}. Keep the conversation short 1-2 mins max.`;
    case ConvoLength.Unbounded:
      return string;
  }
};

export const appendTimeToEndInstructions = (
  convoLength: ConvoLength,
  string: string,
) => {
  switch (convoLength) {
    case ConvoLength.Short:
      return `${string}. End the call within the first minute of the conversation.`;
    case ConvoLength.Medium:
      return `${string}. End the call within the first 2-3 minutes of the conversation.`;
    case ConvoLength.Unbounded:
      return string;
  }
};

export const wrapPrompt = (prompt: PromptSchema, convoLength: ConvoLength) => {
  return {
    ...prompt,
    generalPrompt: appendTimeToGeneralPrompt(convoLength, prompt.generalPrompt),
    endInstructions: appendTimeToEndInstructions(
      convoLength,
      prompt.endInstructions,
    ),
  };
};

export const prompts = {
  friend: friendPrompt,
};
