import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import FingerPrint from "@fingerprintjs/fingerprintjs";
import { ConvoLength, ConvoType } from "@prisma/client";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import mascot from "~/assets/mascot.png";
import Banner from "~/components/banner";
import { Discord, Github, HuggingFace } from "~/components/logos";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useBattleStore } from "~/lib/state";
import { cn } from "~/lib/utils";
import { api } from "~/utils/api";

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

  const { data: models } = api.model.allModels.useQuery();

  return (
    <div className="dark flex h-full min-h-screen w-full  flex-col justify-center bg-festival-yellow-100 px-16 font-inter">
      <div className="flex max-w-xl py-10 sm:py-0">
        <div className="flex w-full items-center justify-center">
          <div className="flex w-[60vw] sm:w-[30vw]">
            <Image src={mascot} alt="parrot mascot"></Image>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col justify-start sm:flex-row">
        <div className="flex sm:w-1/2">
          <div className="flex flex-col space-y-2 sm:max-w-xl">
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
              <a
                href="https://discord.gg/RPReWmsxyT"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Discord className="h-8 w-8" />
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
        <div className="flex w-full flex-1 flex-col space-y-4">
          <div className="flex flex-col space-y-4">
            <p className="text-2xl">Battle</p>
            <p className="text-sm">Configure your battle</p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
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

            <div className="flex pb-20 sm:pb-0">
              <Button
                variant="custom"
                onClick={async () => {
                  void toast.promise(
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

                        void router.push(url);
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

          <div className="flex flex-col space-y-4">
            <p className="text-lg text-neptune-blue-800">Current Models</p>
            <ScrollAreaPrimitive.Root className="h-36 w-full rounded-md">
              <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit] border border-neptune-blue-200/70 py-2">
                <Table>
                  <TableCaption className="dark:text-neptune-blue-700">
                    A list of all the models currently in the pool
                  </TableCaption>
                  <TableHeader>
                    <TableRow className="dark:hover:bg-festival-yellow-300/10">
                      <TableHead className="w-[100px] dark:text-neptune-blue-700">
                        Label
                      </TableHead>
                      <TableHead className="text-right dark:text-neptune-blue-700">
                        Provider
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {models?.map((model) => (
                      <TableRow
                        className="dark:hover:bg-festival-yellow-300/10"
                        key={model.id}
                      >
                        <TableCell className="w-[40rem] font-medium">
                          {model.label}
                        </TableCell>
                        <TableCell className="text-right">
                          {model.provider}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollAreaPrimitive.Viewport>

              <ScrollAreaPrimitive.ScrollAreaScrollbar
                className={cn(
                  "flex touch-none select-none transition-colors",
                  "h-2.5 flex-col border-t border-t-transparent p-[1px]",
                )}
              >
                <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-neptune-blue-400" />
              </ScrollAreaPrimitive.ScrollAreaScrollbar>

              <ScrollAreaPrimitive.Corner className="bg-black" />
            </ScrollAreaPrimitive.Root>
          </div>
        </div>

        <Banner></Banner>
      </div>
    </div>
  );
}
