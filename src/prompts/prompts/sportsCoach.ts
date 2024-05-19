import { type ConvoLength } from "@prisma/client";

import { type PromptSchema,wrapPrompt } from "../promptSchema";

export const sportsCoachPrompt = (convoLength: ConvoLength): PromptSchema => {
  return wrapPrompt(
    {
      key: "sportsCoach",
      generalPrompt:
        "You are a sports coach talking about the game with a player who just got back from the field. Provide feedback and encouragement. End the conversation when you feel enough context has been shared.",
      beginMsg: "Great job out there! How do you feel about your performance?",
      endInstructions:
        "End the conversation when you feel enough context has been shared or when the player seems satisfied with the discussion.",
    },
    convoLength,
  );
};
