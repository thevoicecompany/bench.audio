import { type GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef } from "react";

import Image from "next/image";

import mascot from "~/assets/mascot.png";
import { Button } from "~/components/ui/button";
import { useBattleStore } from "~/lib/state";
import { Actions } from "~/lib/stateMachine";
import toast from "react-hot-toast";
import { cn } from "~/lib/utils";
import LoadingIcon from "~/components/Loading";
import { PhoneOff } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { api } from "~/utils/api";
import { useBeforeunload } from "react-beforeunload";

import { createRoot } from "react-dom/client";

const Battle = ({ id }: { id: string }) => {
  const router = useRouter();

  const modelA = router.query.modelA as string;
  const modelB = router.query.modelB as string;
  const phoneNumber = router.query.phoneNumber as string;

  // const state = ();

  const { state } = useBattleStore();

  // const { state, actions } = useBattleMachine();

  useEffect(() => {
    if (state.kind === "idle") {
      Actions.create(id, modelA, modelB, phoneNumber);
      void Actions.start().then((s) => {
        if (!s.ok) {
          console.error(s);
          toast.error(`Failed to start battle: ${s.val}`);
        }
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      window.useBattleStore = useBattleStore;
      //   actions.create(state, id, modelA, modelB, phoneNumber);
    }
  }, [id, modelA, modelB, phoneNumber, state, state.kind]);

  useEffect(() => {
    if (state.kind === "done") {
      void router.push("/", undefined, { shallow: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.kind]);

  const customComponent = useRef<HTMLDivElement>(null);

  const stopCallback = useRef<() => void>();

  const startConvo = async () => {
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

        // sdk.on("error", (error) => {});

        // sdk.on("message", (message) => {});

        // sdk.on("speech-end", () => {});
        // sdk.on("speech-start", () => {});

        // sdk.on("volume-level", (level) => {});

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
  };

  const handleButtonClick = async (): Promise<void> => {
    console.log("handleButtonClick", state.kind);

    switch (state.kind) {
      case "idle":
      case "preparingConvoA":
      case "preparingConvoB":
      case "createdBattle":
        // nothing to do (button shouldn't be visible)
        return;

      case "preparedConvoA":
      case "preparedConvoB": {
        return await startConvo();
      }

      case "inProgressConvoA":
      case "inProgressConvoB": {
        const result = Actions.finishConvo(true);

        if (!result.ok) {
          toast.error(`Failed to finish conversation: ${result.val}`);
          return;
        }
        break;
      }
      case "doneConvoA": {
        const result = await Actions.nextConvo();
        if (!result.ok) {
          toast.error(`Failed to start next conversation: ${result.val}`);
        }
        console.log("nextConvo", result.val);

        return await startConvo();
      }
    }
  };

  useEffect(() => {
    if (!stopCallback.current) return;

    if (state.kind === "doneConvoA" || state.kind === "doneConvoB") {
      stopCallback.current();

      if (customComponent.current) {
        customComponent.current.childNodes.forEach((c) => c.remove());
      }
    }
  }, [state.kind, stopCallback]);

  const percent = useMemo(() => {
    switch (state.kind) {
      case "idle":
        return 0;
      case "createdBattle":
        return 1;
      case "preparingConvoA":
        return 2;
      case "preparedConvoA":
        return 3;
      case "startingCallA":
        return 4;
      case "inProgressConvoA":
        return 5;
      case "doneConvoA":
        return 6;
      case "preparingConvoB":
        return 7;
      case "preparedConvoB":
        return 8;
      case "startingCallB":
        return 9;
      case "inProgressConvoB":
        return 10;
      case "doneConvoB":
        return 11;
      case "voting":
        return 12;
      case "done":
        return 13;
      case "cancelled":
        return 0;
      case "error":
        return 0;
    }
  }, [state.kind]);

  console.log("percent", { kind: state.kind, percent });

  const { mutateAsync: voteAsync } = api.battle.vote.useMutation();

  const handleVote = (vote: "A" | "B" | "tie" | "tieBothBad") => {
    if (state.kind !== "doneConvoB") {
      toast.error("Please finish both conversations first");
      return;
    }

    Actions.moveToVoting();

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    toast.promise(
      voteAsync({
        battleId: state.battleIds.battleId,
        vote,
      }),
      {
        loading: "Voting...",
        success: () => {
          Actions.moveToDone();
          return "Saved your vote!";
        },
        error: "Vote failed",
      },
    );
  };

  useBeforeunload(() =>
    state.kind === "done" ||
    state.kind === "error" ||
    state.kind === "cancelled"
      ? null
      : "The conversation is still in progress",
  );

  return (
    <div className="dark flex min-h-screen w-full  flex-col items-center justify-center bg-festival-yellow-100 px-16 font-inter">
      <div className="flex w-full items-center justify-center">
        <div className="flex w-[40vw]">
          <Image src={mascot} alt="parrot mascot"></Image>
        </div>
      </div>

      <div className="flex flex-col py-8">
        <div ref={customComponent} id="insert-custom-component"></div>
        {state.kind === "preparingConvoA" ||
        state.kind === "preparingConvoB" ||
        state.kind === "startingCallA" ||
        state.kind === "startingCallB" ? (
          <LoadingIcon className="h-8 w-8 animate-spin text-neptune-blue-400" />
        ) : state.kind === "preparedConvoA" ? (
          <Button
            onClick={handleButtonClick}
            variant="custom"
            className="bg-froly-red-400 text-gray-200 hover:bg-froly-red-500"
          >
            Start Battle
          </Button>
        ) : state.kind === "inProgressConvoA" ||
          state.kind === "inProgressConvoB" ? (
          <Button
            onClick={handleButtonClick}
            variant="custom"
            className=" inline-flex space-x-2 text-froly-red-400 hover:text-froly-red-500"
          >
            <PhoneOff className="h-6 w-6" /> End Call
          </Button>
        ) : state.kind === "doneConvoA" ? (
          <Button
            onClick={handleButtonClick}
            variant="custom"
            className="bg-froly-red-400 text-gray-200 hover:bg-froly-red-500"
          >
            Next Convo
          </Button>
        ) : state.kind === "doneConvoB" ? (
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="custom"
                className="bg-froly-red-400 text-gray-200 hover:bg-froly-red-500"
              >
                Pick your winner
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-festival-yellow-100">
              <div className="mx-auto w-full max-w-md">
                <DrawerHeader>
                  <DrawerTitle>Vote</DrawerTitle>
                  <DrawerDescription>
                    Which conversation was better?
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-4 pb-0">
                  <div className="flex items-center justify-center gap-4 space-x-6">
                    <DrawerClose asChild>
                      <button
                        onClick={() => handleVote("A")}
                        className="flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded p-20 shadow hover:shadow-lg"
                      >
                        <p className="z-10 whitespace-nowrap text-4xl font-medium text-neptune-blue-400">
                          Model A
                        </p>
                      </button>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <button
                        onClick={() => handleVote("B")}
                        className="flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded p-20 shadow hover:shadow-lg"
                      >
                        <p className="z-10 whitespace-nowrap text-4xl font-medium text-neptune-blue-400 ">
                          Model B
                        </p>
                      </button>
                    </DrawerClose>
                  </div>
                </div>
                <DrawerFooter>
                  <div className="flex items-center justify-between">
                    <DrawerClose asChild>
                      <Button onClick={() => handleVote("tie")} variant="ghost">
                        Tie
                      </Button>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <Button
                        onClick={() => handleVote("tieBothBad")}
                        variant="ghost"
                      >
                        Tie, Both Bad
                      </Button>
                    </DrawerClose>
                  </div>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        ) : null}
      </div>

      <div className="flex w-full max-w-5xl">
        <div className="flex w-full">
          <div className="mt-6 w-full" aria-hidden="true">
            <div className="overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-neptune-blue-300"
                style={{ width: `${(percent / 13) * 100}%` }}
              />
            </div>
            <div className="mt-6 hidden grid-cols-7 items-center text-sm font-medium text-gray-600 sm:grid">
              <div
                className={cn(
                  percent >= 1 ? "text-neptune-blue-500" : "",
                  "flex justify-center",
                )}
              >
                Preparing Model A
              </div>
              <div
                className={cn(
                  percent >= 3 ? "text-neptune-blue-500" : "",
                  "flex justify-center",
                )}
              >
                Talk to Model A
              </div>
              <div
                className={cn(
                  percent >= 6 ? "text-neptune-blue-500" : "",
                  "flex justify-center",
                )}
              >
                Finish Model A
              </div>
              <div
                className={cn(
                  percent >= 7 ? "text-neptune-blue-500" : "",
                  "flex justify-center",
                )}
              >
                Preparing Model B
              </div>
              <div
                className={cn(
                  percent >= 8 ? "text-neptune-blue-500" : "",
                  "flex justify-center",
                )}
              >
                Talk to Model B
              </div>
              <div
                className={cn(
                  percent >= 11 ? "text-neptune-blue-500" : "",
                  "flex justify-center",
                )}
              >
                Finish Model B
              </div>
              <div
                className={cn(
                  percent >= 12 ? "text-neptune-blue-500" : "",
                  "flex justify-center",
                )}
              >
                Vote
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id;

  if (!id) {
    return {
      redirect: {
        destination: "api/battle/new",
        permanent: false,
      },
    };
  }

  return {
    props: {
      id,
    },
  };
};

export default Battle;
