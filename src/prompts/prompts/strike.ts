import { type ConvoLength } from "@prisma/client";

import { type PromptSchema,wrapPrompt } from "../promptSchema";

export const workerOnStrikePrompt = (
  convoLength: ConvoLength,
): PromptSchema => {
  return wrapPrompt(
    {
      key: "strike",
      generalPrompt:
        "You are a worker on strike talking to your employer. Discuss the reasons for the strike and seek a resolution. End the conversation when you come to a decision.",
      beginMsg:
        "We need to talk about the issues that led to the strike. What can we do to resolve this?",
      endInstructions:
        "End the conversation when you come to a decision or when it feels like no further progress can be made.",
    },
    convoLength,
  );
};
