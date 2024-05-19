/* eslint-disable @typescript-eslint/ban-ts-comment */
import { create } from "zustand";

import { type ConvoLength, type ConvoType } from "@prisma/client";

import { type BattleMachine, type BattleState } from "./stateMachine";

type State = {
  battleType: ConvoType;
  battleLength: ConvoLength;
  phoneNumber?: string;
  prompt: string;
  state: BattleState<BattleMachine["allStates"]>;

  setBattleType: (type: ConvoType) => void;
  setBattleLength: (length: ConvoLength) => void;
  setPhoneNumber: (number: string) => void;
  setPrompt: (prompt: string) => void;

  setStateMachine: <K extends BattleMachine["allStates"]>(
    kind: K,
    value: Omit<BattleState<K>, "kind">,
  ) => BattleState<K>;
};

export const useBattleStore = create<State>((set) => ({
  battleType: "Online",
  battleLength: "Medium",
  prompt: "",
  state: {
    kind: "idle",
  },

  setBattleType: (type) => set({ battleType: type }),
  setBattleLength: (length) => set({ battleLength: length }),
  setPhoneNumber: (number) => set({ phoneNumber: number }),
  setPrompt: (prompt) => set({ prompt }),

  // @ts-expect-error
  setStateMachine(kind, value) {
    // @ts-expect-error
    set({ state: { ...value, kind } });

    return value;
  },
}));
