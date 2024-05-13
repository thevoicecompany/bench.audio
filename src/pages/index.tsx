import { ConvoLength, ConvoType } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import mascot from "~/assets/mascot.png";
import { Github, HuggingFace } from "~/components/logos";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useBattleStore } from "~/lib/state";

import FingerPrint from "@fingerprintjs/fingerprintjs";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/router";

export default function Home() {
  const {
    battleType,
    battleLength,
    setBattleLength,
    phoneNumber,
    setPhoneNumber,
  } = useBattleStore();

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    FingerPrint.load().then((fp) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      fp.get().then((val) => {
        setUserId(val.visitorId);
      });
    });
  }, []);

  const router = useRouter();

  const { mutateAsync: createBattle } = api.battle.create.useMutation();

  return (
    <div className="dark flex min-h-screen w-full  flex-col justify-center bg-festival-yellow-100 px-16 font-inter">
      <div className="flex max-w-xl">
        <div className="flex w-full items-center justify-center">
          <div className="flex w-[30vw]">
            <Image src={mascot} alt="parrot mascot"></Image>
          </div>
        </div>
      </div>
      <div className="flex w-full justify-start">
        <div className="flex w-1/2">
          <div className="flex max-w-xl flex-col space-y-2">
            <p className="py-4 font-inter text-2xl">
              bench.audio is the battleground for voice agents
            </p>
            <div className="flex space-x-4 py-2">
              <a
                href="https://github.com/thevoicecompany/bench.audio"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-8 w-8" />
              </a>
              <a
                href="https://huggingface.co/collections/thevoicecompany/benchaudio-6642906720571dc0e70925c0"
                target="_blank"
                rel="noopener noreferrer"
              >
                <HuggingFace className="h-8 w-8" />
              </a>
            </div>

            <div className="text-md flex flex-col">
              <p className="text-xl">Rules:</p>
              <ul className="list-disc pl-4">
                <li>Prompt the voice assistants with any system prompt</li>
                <li>Talk to two different voice assistants back to back</li>
                <li>
                  Pick the winner - the vote {`won't`} be counted if you only
                  talk to one voice assistant
                </li>
              </ul>
              <p className="text-xl">Leaderboard (coming soon)</p>
              <p>
                will be an ELO leaderboard updated every two weeks published on
                huggingface - using the same{" "}
                <a href="" className="text-neptune-blue-400 underline">
                  Bradley-Terry model{" "}
                </a>
              </p>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-1 flex-col">
          <div className="flex flex-col space-y-4">
            <p className="py-4 text-2xl">Battle</p>
            <p className="text-sm">Configure your battle</p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <p className="text-sm">Battle type</p>
                <Select
                  value={battleType}
                  defaultValue="online"
                  // onValueChange={setBattleType}
                >
                  <SelectTrigger className="w-[120px] border-festival-yellow-100 bg-festival-yellow-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-festival-yellow-100">
                    <SelectItem
                      className="focus:bg-festival-yellow-200/20"
                      value={ConvoType.Phone}
                      disabled
                    >
                      Phone
                    </SelectItem>
                    <SelectItem
                      className="focus:bg-festival-yellow-200/20"
                      value={ConvoType.Online}
                    >
                      Online
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <p className="text-sm">Battle Length</p>
                <Select
                  value={battleLength}
                  defaultValue="medium"
                  onValueChange={setBattleLength}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-festival-yellow-100">
                    <SelectItem
                      className="focus:bg-festival-yellow-200/20"
                      value={ConvoLength.Short}
                    >
                      Under 1m
                    </SelectItem>
                    <SelectItem
                      className="focus:bg-festival-yellow-200/20"
                      value={ConvoLength.Medium}
                    >
                      1-2m
                    </SelectItem>
                    <SelectItem
                      className="focus:bg-festival-yellow-200/20"
                      value={ConvoLength.Unbounded}
                    >
                      2m+
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {battleType === ConvoType.Phone && (
              <div className="flex max-w-xs items-center space-x-2 text-sm">
                <p className="text-sm">Phone number</p>
                <Input
                  type="tel"
                  className="w-[180px] bg-festival-yellow-100/10"
                  placeholder="+1 (555) 555-5555"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            )}

            {/* <div className="flex max-w-sm flex-col space-y-4">
              <p className="">Prompt your voice assistant</p>
              <Textarea
                className="border-opacity-40 bg-festival-yellow-100/10"
                value={prompt}
                placeholder="You are a helpful assistant"
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div> */}

            <div className="flex">
              <Button
                variant="custom"
                onClick={async () => {
                  // eslint-disable-next-line @typescript-eslint/no-floating-promises
                  toast.promise(
                    createBattle({
                      fingerprint: userId ?? "random-user",
                      length:
                        battleLength === ConvoLength.Short
                          ? "short"
                          : battleLength === ConvoLength.Medium
                            ? "medium"
                            : battleLength === ConvoLength.Unbounded
                              ? "unbounded"
                              : "medium",
                      type: "Online",
                    }),
                    {
                      loading: "Creating battle...",
                      success: (data) => {
                        const id = data.battle.id;
                        const modelA = data.modelA.id;
                        const modelB = data.modelB.id;

                        const url = `/battles/${id}?modelA=${modelA}&modelB=${modelB}`;

                        console.log({ url });

                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                        router.push(url);
                        return "Redirecting...";
                      },
                      error: (e) => {
                        return `Failed to create battle: ${e}`;
                      },
                    },
                  );
                }}
                className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-froly-red-400 px-4 py-2 text-sm font-medium text-gray-50 transition-colors hover:bg-froly-red-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-slate-300"
              >
                Start Battle ⚔️
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
