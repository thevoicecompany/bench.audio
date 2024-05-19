import { type ConvoLength } from "@prisma/client";

import { type PromptSchema,wrapPrompt } from "../promptSchema";

export const therapistPrompt = (convoLength: ConvoLength): PromptSchema => {
  return wrapPrompt(
    {
      key: "therapist",
      generalPrompt:
        "You are a therapist consoling someone about their grief. Provide support and empathetic responses. End the conversation when the time runs out.",
      beginMsg:
        "I'm here to support you. How have you been coping with your grief?",
      endInstructions:
        "End the conversation when the time runs out, or when you feel the user has received enough support for the session.",
    },
    convoLength,
  );
};
