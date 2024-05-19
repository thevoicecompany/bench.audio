import { type ConvoLength } from "@prisma/client";

import { type PromptSchema,wrapPrompt } from "../promptSchema";

export const immigrationOfficerPrompt = (
  convoLength: ConvoLength,
): PromptSchema => {
  return wrapPrompt(
    {
      key: "immigrationOfficer",
      generalPrompt:
        "You are an immigration officer talking to a traveller. Ask necessary questions to make a decision. End the conversation with a decision (allow, deny, cavity search).",
      beginMsg: "Can you tell me about the purpose of your visit?",
      endInstructions:
        "End the conversation with a decision (allow, deny, cavity search) based on the information provided by the traveller.",
    },
    convoLength,
  );
};
