import { ConvoLength } from "@prisma/client";
import { friendPrompt } from "./prompts/friend";
import { workerOnStrikePrompt } from "./prompts/strike";
import { immigrationOfficerPrompt } from "./prompts/immigrationOfficer";

import { sportsCoachPrompt } from "./prompts/sportsCoach";

import { therapistPrompt } from "./prompts/therapist";

export type PromptSchema = {
  key: string;
  fullKey?: string;
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

const wrappedKey = (key: string, convoLength: ConvoLength) =>
  `${key}-${convoLength}`;

export const wrapPrompt = (prompt: PromptSchema, convoLength: ConvoLength) => {
  return {
    ...prompt,
    fullKey: wrappedKey(prompt.key, convoLength),
    generalPrompt: appendTimeToGeneralPrompt(convoLength, prompt.generalPrompt),
    endInstructions: appendTimeToEndInstructions(
      convoLength,
      prompt.endInstructions,
    ),
  };
};

export const prompts = {
  friend: friendPrompt,
  strike: workerOnStrikePrompt,
  immigration: immigrationOfficerPrompt,
  sportsCoach: sportsCoachPrompt,
  therapist: therapistPrompt,
};
