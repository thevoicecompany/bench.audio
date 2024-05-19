// commonClient.tsx
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { HumeProvider } from "../impls/hume/hume";
import type { RetellProvider } from "../impls/retell/retell";
import type { VapiProvider } from "../impls/vapi/vapi";
import type { ExtractDetails } from "./providerSchema";
import type { ClientStartConvo } from "./providerTypes";
import type { BattleState } from "~/lib/stateMachine";

import { type MutableRefObject, type RefObject, useCallback } from "react";
import { createRoot } from "react-dom/client";
import toast from "react-hot-toast";
import { Err, Ok, type Result } from "ts-results";

import { humeClient } from "../impls/hume/client";
import { retellClient } from "../impls/retell/client";
import { vapiClient } from "../impls/vapi/client";

import { Actions } from "~/lib/stateMachine";

export const switchStartConvo = async (
  state: BattleState<"preparedConvoA" | "preparedConvoB">,
): Promise<Result<ClientStartConvo, string>> => {
  switch (state.provider) {
    case "Retell": {
      const sdk = await retellClient.clientStartCall(
        state.details as ExtractDetails<RetellProvider>["details"],
      );

      return Ok({ type: "retell", sdk });
    }
    case "Vapi": {
      const sdk = await vapiClient.clientStartCall(
        state.details as ExtractDetails<VapiProvider>["details"],
      );

      return Ok({ type: "vapi", sdk });
    }
    case "Hume": {
      const component = await humeClient.clientStartCall(
        state.details as ExtractDetails<HumeProvider>["details"],
      );

      return Ok({ type: "hume", component: component });
    }
    case "Bland": {
      throw new Error("Not implemented");
    }

    default:
      return Err("Unable to start conversation invalid provider");
  }
};

export const useStartConvo = (
  stopCallback: MutableRefObject<(() => void) | undefined>,
  customComponent: RefObject<HTMLDivElement>,
) => {
  const startConvo = useCallback(async () => {
    const result = await Actions.startConvo();

    console.log("startConvo", result.val);

    if (!result.ok) {
      toast.error(`Failed to start conversation: ${result.val}`);
      console.error(result.val);
      return;
    }

    switch (result.val.type) {
      case "retell": {
        const sdk = result.val.sdk;

        // Setup event listeners
        // When the whole agent and user conversation starts
        sdk.on("conversationStarted", () => {
          console.log("Conversation started");
          Actions.moveToInProgress();
        });

        // When the whole agent and user conversation ends
        sdk.on("conversationEnded", () => {
          console.log("Conversation ended");
          Actions.finishConvo();
        });

        sdk.on("error", (error) => {
          console.error("An error occurred:", error);
        });

        // Update message such as transcript, turntaking information
        sdk.on("update", (update) => {
          // Print live transcript as needed
          console.log("update", update);
        });

        // Metadata passed from custom LLM server
        sdk.on("metadata", (metadata) => {
          console.log("metadata", metadata);
        });

        // Agent audio in real time, can be used for animation
        sdk.on("audio", (_audio: Uint8Array) => {
          console.log("There is audio");
        });

        // Signals agent audio starts playback, does not work when ambient sound is used
        // Useful for animation
        sdk.on("agentStartTalking", () => {
          console.log("agentStartTalking");
        });

        // Signals all agent audio in buffer has been played back, does not work when ambient sound is used
        // Useful for animation
        sdk.on("agentStopTalking", () => {
          console.log("agentStopTalking");
        });

        stopCallback.current = () => {
          sdk.stopConversation();
        };

        break;
      }
      case "vapi": {
        const sdk = result.val.sdk;
        sdk.on("call-end", () => {
          console.log("call-end");
          Actions.finishConvo();
        });

        sdk.on("call-start", () => {
          Actions.moveToInProgress();
        });

        stopCallback.current = () => {
          sdk.stop();
        };

        break;
      }
      case "hume": {
        const HumeComponent = result.val.component;

        console.log("render hume", customComponent.current);

        if (!customComponent.current) {
          toast.error("Failed to render custom component");
          return;
        }

        const root = createRoot(customComponent.current); // createRoot(container!) if you use TypeScript

        if (customComponent.current) {
          root.render(
            <HumeComponent
              moveToInProgress={() => Actions.moveToInProgress()}
              finishConvo={() => Actions.finishConvo()}
              setStopCb={(cb) => {
                stopCallback.current = cb;
              }}
            />,
          );
        } else {
          toast.error("Failed to render custom component");
        }
      }
    }
  }, [stopCallback, customComponent]);

  return startConvo;
};
