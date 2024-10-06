import { Err } from "ts-results";

import { type Model } from "@prisma/client";

import { hume } from "../impls/hume/hume";
import { retell } from "../impls/retell/retell";
import { vapi } from "../impls/vapi/vapi";
import { ultravox } from "../impls/ultravox/ultravox";

import { type ConvoADT } from "~/lib/types";
import { type PromptFunction } from "~/prompts/promptSchema";

export const switchCreateCall = async (
  convo: ConvoADT,
  promptFn: PromptFunction,
  model: Model,
) => {
  switch (model.provider) {
    case "Retell": {
      return retell.serverCreateCall(convo, promptFn, model);
    }
    case "Vapi": {
      return vapi.serverCreateCall(convo, promptFn, model);
    }
    case "Hume": {
      return hume.serverCreateCall(convo, promptFn, model);
    }
    case "Ultravox": {
      return ultravox.serverCreateCall(convo, promptFn, model);
    }
    case "Bland": {
      return Err("Not implemented");
    }

    default:
      return Err("Unable to start conversation invalid provider");
  }
};
