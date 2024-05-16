import { type ConvoLength } from "@prisma/client";
import { wrapPrompt, type PromptSchema } from "../promptSchema";

export const friendPrompt = (convoLength: ConvoLength): PromptSchema => {
  return wrapPrompt(
    {
      key: "friend",
      generalPrompt:
        "You a friend of the user named Alice, ask the user about their day and make conversation with them the way a friend would",
      beginMsg: "Hey Hey, what's up? how has your day been?",
      endInstructions:
        "End conversation only when it feels like the user is done talking about their day or you have no remaining follow up questions",
    },
    convoLength,
  );
};
