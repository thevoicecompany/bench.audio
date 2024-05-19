/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/ban-types */
import { Err, Ok, type Result } from "ts-results";
import { type SelectStates,type StateMachineDef } from "tyfsm";

import { type Provider } from "@prisma/client";

import { useBattleStore } from "./state";
import { type ConvoADT,type ExtendedConvoADT } from "./types";

import { switchStartConvo } from "~/providers/lib/commonClient";
import { type ClientStartConvo } from "~/providers/lib/providerTypes";
import { clientApi,type RouterOutputs } from "~/utils/api";

type BattleIds = {
  modelAId: string;
  modelBId: string;
  battleId: string;
};

type PreparingConvo = {
  battleIds: BattleIds;
  phoneNumber?: string;
};

type PreparedConvo = {
  battleIds: BattleIds;
  provider: Provider;
  convo: ConvoADT;
  details: RouterOutputs["battle"]["prepareModel"]["details"];
  conversationId: string;
};

type InProgressConvo = {
  battleIds: BattleIds;
  conversationId: string;
  convo: ExtendedConvoADT;
};

type DoneConvo = {
  battleIds: BattleIds;
  conversationId: string;
  convo: ExtendedConvoADT;
  transcript: string;
};

export type BattleMachine = StateMachineDef<
  {
    idle: {};
    createdBattle: {
      battleIds: BattleIds;
      phoneNumber?: string;
    };
    preparingConvoA: PreparingConvo;
    preparedConvoA: PreparedConvo;
    startingCallA: InProgressConvo;
    inProgressConvoA: InProgressConvo;
    doneConvoA: DoneConvo;
    preparingConvoB: PreparingConvo;
    preparedConvoB: PreparedConvo;
    startingCallB: InProgressConvo;
    inProgressConvoB: InProgressConvo;
    doneConvoB: DoneConvo;
    voting: {
      battleIds: BattleIds;
    };
    done: {
      battleIds: BattleIds;
    };
    cancelled: {
      battleIds: BattleIds;
      prevState: string;
    };
    error: {
      battleIds: BattleIds;
      prevState: string;
      error: string;
    };
  },
  {
    idle: ["createdBattle"];
    createdBattle: ["preparingConvoA"];
    preparingConvoA: ["preparedConvoA", "cancelled", "error"];
    preparedConvoA: ["startingCallA", "cancelled", "error"];
    startingCallA: ["inProgressConvoA", "cancelled", "error"];
    inProgressConvoA: ["doneConvoA", "cancelled", "error"];
    doneConvoA: ["preparingConvoB", "cancelled", "error"];
    preparingConvoB: ["preparedConvoB", "cancelled", "error"];
    preparedConvoB: ["startingCallB", "cancelled", "error"];
    startingCallB: ["inProgressConvoB", "cancelled", "error"];
    inProgressConvoB: ["doneConvoB", "cancelled", "error"];
    doneConvoB: ["voting", "cancelled", "error"];
    voting: ["done", "cancelled", "error"];
    done: ["idle"];
    cancelled: ["idle"];
    error: ["idle"];
  }
>;

export type BattleState<K extends BattleMachine["allStates"]> = SelectStates<
  BattleMachine,
  K
>;

type Actions = {
  create: (
    state: BattleState<"idle">,
    battleId: string,
    modelAId: string,
    modelBId: string,
    phoneNumber?: string,
  ) => Result<BattleState<"createdBattle">, string>;
  start: (
    state: BattleState<"createdBattle">,
  ) => Promise<Result<BattleState<"preparedConvoA">, string>>;
  startConvo: <K extends "preparedConvoA" | "preparedConvoB">(
    state: BattleState<K>,
  ) => Promise<Result<ClientStartConvo, string>>;

  moveToInProgress: <K extends "startingCallA" | "startingCallB">(
    state: BattleState<K>,
  ) => Result<BattleState<"inProgressConvoA" | "inProgressConvoB">, string>;

  finishConvo: <K extends "inProgressConvoA" | "inProgressConvoB">(
    state: BattleState<K>,
  ) => Result<
    K extends "inProgressConvoA"
      ? BattleState<"doneConvoA">
      : BattleState<"doneConvoB">,
    string
  >;
  nextConvo: (
    state: BattleState<"doneConvoA">,
  ) => Promise<Result<BattleState<"inProgressConvoB">, string>>;
  moveToVoting: (
    state: BattleState<"doneConvoB">,
  ) => Result<BattleState<"done">, string>;

  moveToDone: (
    state: BattleState<"voting">,
  ) => Result<BattleState<"done">, string>;

  reset: (state: BattleState<"done">) => Result<BattleState<"idle">, string>;
  cancel: (
    state: BattleState<
      | "createdBattle"
      | "preparedConvoA"
      | "inProgressConvoA"
      | "doneConvoA"
      | "preparingConvoB"
      | "inProgressConvoB"
      | "doneConvoB"
      | "voting"
    >,
  ) => Result<BattleState<"cancelled">, string>;
  error: (
    state: BattleState<
      | "createdBattle"
      | "preparedConvoA"
      | "inProgressConvoA"
      | "doneConvoA"
      | "preparingConvoB"
      | "inProgressConvoB"
      | "doneConvoB"
      | "voting"
    >,
    error: string,
  ) => Result<BattleState<"error">, string>;
};

const setState = <K extends BattleMachine["allStates"]>(
  kind: K,
  state: Omit<BattleState<K>, "kind">,
): BattleState<K> => {
  const val = useBattleStore.getState().setStateMachine(kind, state);
  return val;
};

const getState = <K extends BattleMachine["allStates"]>() =>
  useBattleStore.getState().state as BattleState<K>;

const createIntermediateState = <K extends BattleMachine["allStates"]>(
  kind: K,
  state: Omit<BattleState<K>, "kind">,
): BattleState<K> => {
  const val = useBattleStore.getState().setStateMachine(kind, state);
  return val;
};

// const getState = () => useBattleStore.getState().state;

const actions: Actions = {
  create(state, battleId, modelAId, modelBId, phoneNumber) {
    const val = setState("createdBattle", {
      battleIds: {
        battleId,
        modelAId,
        modelBId,
      },
      phoneNumber,
    });

    return Ok(val);
  },
  async start(state) {
    console.log("actions start");
    if (state.kind !== "createdBattle")
      return Err("not in created battle state");

    const newState = createIntermediateState("preparingConvoA", {
      battleIds: state.battleIds,
      phoneNumber: state.phoneNumber,
    });
    try {
      const data = await clientApi.battle.prepareModel.mutate({
        battleId: state.battleIds.battleId,
        modelId: state.battleIds.modelAId,
        convoIndex: "A",
      });

      const finalState = setState("preparedConvoA", {
        battleIds: newState.battleIds,
        provider: data.provider,
        convo: data.convo,
        details: data.details,
        conversationId: data.conversationId,
      });

      return Ok(finalState);
    } catch (e) {
      return Err(`Error preparing model: ${e}`);
    }
  },
  async startConvo(state) {
    if (state.convo.type === "Phone") {
      return Err("Not implemented");
    }

    const newStateKind =
      state.kind === "preparedConvoA" ? "startingCallA" : "startingCallB";

    createIntermediateState(newStateKind, {
      battleIds: state.battleIds,
      conversationId: state.conversationId,
      // @ts-expect-error
      convo: state.convo,
    });

    return switchStartConvo(state);
  },

  moveToInProgress(state) {
    switch (state.kind) {
      case "startingCallA":
        return Ok(
          setState("inProgressConvoA", {
            battleIds: state.battleIds,
            conversationId: state.conversationId,
            convo: state.convo,
          }),
        );
      case "startingCallB":
        return Ok(
          setState("inProgressConvoB", {
            battleIds: state.battleIds,
            conversationId: state.conversationId,
            convo: state.convo,
          }),
        );
      default:
        return Err("Invalid state");
    }
  },

  // @ts-expect-error
  finishConvo(state) {
    switch (state.kind) {
      case "inProgressConvoA": {
        return Ok(
          setState("doneConvoA", {
            battleIds: state.battleIds,
            conversationId: state.conversationId,
            convo: state.convo,
            transcript: "",
          }),
        );
      }
      case "inProgressConvoB": {
        return Ok(
          setState("doneConvoB", {
            battleIds: state.battleIds,
            conversationId: state.conversationId,
            convo: state.convo,
            transcript: "",
          }),
        );
      }
    }
  },
  // @ts-expect-error
  async nextConvo(state) {
    const newState = createIntermediateState("preparingConvoB", {
      battleIds: state.battleIds,
      // phoneNumber: state.phoneNumber,
    });
    try {
      const data = await clientApi.battle.prepareModel.mutate({
        battleId: state.battleIds.battleId,
        modelId: state.battleIds.modelBId,
        convoIndex: "B",
      });

      const finalState = setState("preparedConvoB", {
        battleIds: newState.battleIds,
        provider: data.provider,
        convo: data.convo,
        details: data.details,
        conversationId: data.conversationId,
      });

      return Ok(finalState);
    } catch (e) {
      return Err(`Error preparing model: ${e}`);
    }
  },

  moveToVoting(state) {
    return Ok(
      setState("done", {
        battleIds: state.battleIds,
      }),
    );
  },

  moveToDone(state) {
    return Ok(
      setState("done", {
        battleIds: state.battleIds,
      }),
    );
  },
};

const wrappedActions = {
  create: (
    battleId: string,
    modelAId: string,
    modelBId: string,
    phoneNumber?: string,
  ) => {
    return actions.create(
      getState<"idle">(),
      battleId,
      modelAId,
      modelBId,
      phoneNumber,
    );
  },

  start: () => {
    return actions.start(getState<"createdBattle">());
  },
  startConvo: () => {
    return actions.startConvo(getState<"preparedConvoA" | "preparedConvoB">());
  },
  finishConvo: (_earlyEnd?: boolean) => {
    return actions.finishConvo(
      getState<"inProgressConvoA" | "inProgressConvoB">(),
    );
  },

  nextConvo: () => {
    return actions.nextConvo(getState<"doneConvoA">());
  },

  moveToVoting: () => {
    return actions.moveToVoting(getState<"doneConvoB">());
  },

  moveToDone: () => {
    return actions.moveToDone(getState<"voting">());
  },

  moveToInProgress: () => {
    return actions.moveToInProgress(
      getState<"startingCallA" | "startingCallB">(),
    );
  },
};

export const Actions = wrappedActions;
