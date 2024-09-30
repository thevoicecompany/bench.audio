import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import FingerPrint from "@fingerprintjs/fingerprintjs";
import { ConvoLength, ConvoType } from "@prisma/client";

import mascot from "~/assets/mascot.png";
import Banner from "~/components/banner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useBattleStore } from "~/lib/state";
import { api } from "~/utils/api";

export default function NewBattle() {
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
    <div className="dark flex h-full min-h-screen w-full  flex-col items-center justify-center bg-festival-yellow-100 px-16 font-inter">
      <div className="flex max-w-xl py-10 sm:py-0">
        <div className="flex w-full items-center justify-center">
          <div className="flex w-[60vw] sm:w-[30vw]">
            <Image src={mascot} alt="parrot mascot" />
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center sm:flex-row">
        <div className="flex w-full flex-1 flex-col items-center space-y-4">
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
        </div>

        <Banner />
      </div>
    </div>
  );
}
