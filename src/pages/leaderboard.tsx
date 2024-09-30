import Image from "next/image";
import Link from "next/link";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import mascot from "../assets/mascot.png";

import { Discord, Github, HuggingFace } from "~/components/logos";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { api } from "~/utils/api";

const LeaderBoard = () => {
  const { data: models } = api.model.allModels.useQuery();

  return (
    <div className="dark flex h-full min-h-screen w-full  flex-col justify-center bg-festival-yellow-100 px-16 font-inter">
      <div className="flex max-w-xl py-10 sm:py-0">
        <div className="flex w-full items-center justify-center">
          <div className="flex w-[60vw] sm:w-[30vw]">
            <Image src={mascot} alt="parrot mascot" />
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col justify-start sm:flex-row">
        <div className="flex sm:w-1/2">
          <div className="flex flex-col space-y-2 sm:max-w-xl">
            <p className="py-4 font-inter text-2xl">
              <Link href="/" className="underline">
                bench.audio
              </Link>{" "}
              is the battleground for voice agents
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

            <div className="text-md flex flex-col space-y-4">
              <p className="text-xl">How does the leaderboard work?</p>
              <p>
                This is an ELO LeaderBoard generated using this notebook. It is
                almost identical to the ELO notebook for lmsys, which uses the{" "}
                <a
                  href="https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model"
                  className="text-neptune-blue-400 underline"
                >
                  Bradley-Terry model{" "}
                </a>
              </p>

              <div>
                <Link
                  href="/battles/new"
                  className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-froly-red-400 px-4 py-2 text-sm font-medium text-gray-50 transition-colors hover:bg-froly-red-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-slate-300"
                >
                  Start new Battle
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:w-1/2">
          <p className="text-lg text-neptune-blue-800">Current Models</p>
          <ScrollAreaPrimitive.Root className="h-full w-full rounded-md">
            <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit] border border-neptune-blue-200/70 py-2">
              <Table>
                <TableCaption className="dark:text-neptune-blue-700">
                  A list of all the models currently in the pool
                </TableCaption>
                <TableHeader>
                  <TableRow className="dark:hover:bg-festival-yellow-300/10">
                    <TableHead className="text-left dark:text-neptune-blue-700">
                      ELO
                    </TableHead>
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
                      <TableCell className="text-left">
                        {model.elo?.score}
                      </TableCell>
                      <TableCell className="w-[40rem] truncate font-medium">
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
          </ScrollAreaPrimitive.Root>
        </div>
      </div>
    </div>
  );
};

export default LeaderBoard;
