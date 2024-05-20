/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/ban-types */
import toast from "react-hot-toast";
import { Err, Ok, type Result } from "ts-results";
import { type SelectStates, type StateMachineDef } from "tyfsm";

import { BattleState as DbBattleState, type Provider } from "@prisma/client";

import { useBattleStore } from "./state";
import { type ConvoADT, type ExtendedConvoADT } from "./types";

import { switchStartConvo } from "~/providers/lib/commonClient";
import { type ClientStartConvo } from "~/providers/lib/providerTypes";
import { clientApi, type RouterOutputs } from "~/utils/api";

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
      battleIds?: BattleIds;
      prevState: string;
      error: string;
    };
  },
  {
    idle: ["createdBattle", "error"];
    createdBattle: ["preparingConvoA", "error"];
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
  ) => Promise<Result<BattleState<"createdBattle">, string>>;
  start: (
    state: BattleState<"createdBattle">,
  ) => Promise<Result<BattleState<"preparedConvoA">, string>>;
  startConvo: <K extends "preparedConvoA" | "preparedConvoB">(
    state: BattleState<K>,
  ) => Promise<Result<ClientStartConvo, string>>;

  moveToInProgress: <K extends "startingCallA" | "startingCallB">(
    state: BattleState<K>,
  ) => Promise<
    Result<BattleState<"inProgressConvoA" | "inProgressConvoB">, string>
  >;

  finishConvo: <K extends "inProgressConvoA" | "inProgressConvoB">(
    state: BattleState<K>,
  ) => Promise<
    Result<
      K extends "inProgressConvoA"
        ? BattleState<"doneConvoA">
        : BattleState<"doneConvoB">,
      string
    >
  >;
  nextConvo: (
    state: BattleState<"doneConvoA">,
  ) => Promise<Result<BattleState<"inProgressConvoB">, string>>;
  moveToVoting: (
    state: BattleState<"doneConvoB">,
  ) => Promise<Result<BattleState<"done">, string>>;

  moveToDone: (
    state: BattleState<"voting">,
  ) => Promise<Result<BattleState<"done">, string>>;

  reset: (
    state: BattleState<"done">,
  ) => Promise<Result<BattleState<"idle">, string>>;
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
  ) => Promise<Result<BattleState<"cancelled">, string>>;
  moveToError: (
    state: BattleState<BattleMachine["allStates"]>,
    error: string,
  ) => Promise<Result<BattleState<"error">, string>>;
};

const convertBattleStateStringToEnum = <K extends BattleMachine["allStates"]>(
  state: K,
): DbBattleState => {
  switch (state) {
    case "idle":
      return DbBattleState.Idle;
    case "createdBattle":
      return DbBattleState.CreatedBattle;
    case "preparingConvoA":
      return DbBattleState.PreparingConvoA;
    case "preparedConvoA":
      return DbBattleState.PreparedConvoA;
    case "startingCallA":
      return DbBattleState.StartingCallA;
    case "inProgressConvoA":
      return DbBattleState.InProgressConvoA;
    case "doneConvoA":
      return DbBattleState.DoneConvoA;
    case "preparingConvoB":
      return DbBattleState.PreparingConvoB;
    case "preparedConvoB":
      return DbBattleState.PreparedConvoB;
    case "startingCallB":
      return DbBattleState.StartingCallB;
    case "inProgressConvoB":
      return DbBattleState.InProgressConvoB;
    case "doneConvoB":
      return DbBattleState.DoneConvoB;
    case "voting":
      return DbBattleState.Voting;
    case "done":
      return DbBattleState.Done;
    case "cancelled":
      return DbBattleState.Cancelled;
    case "error":
      return DbBattleState.Error;
    default: {
      throw new Error(`Invalid state: ${state}`);
    }
  }
};

const setState = async <K extends BattleMachine["allStates"]>(
  kind: K,
  state: Omit<BattleState<K>, "kind">,
): Promise<BattleState<K>> => {
  const val = useBattleStore.getState().setStateMachine(kind, state);

  if (val.kind !== "idle" && "battleIds" in val && val.battleIds) {
    await clientApi.battle.updateState.mutate({
      battleId: val.battleIds.battleId,
      newState: convertBattleStateStringToEnum(val.kind),
    });
  }

  return val;
};

const getState = <K extends BattleMachine["allStates"]>() =>
  useBattleStore.getState().state as BattleState<K>;

const createIntermediateState = async <K extends BattleMachine["allStates"]>(
  kind: K,
  state: Omit<BattleState<K>, "kind">,
): Promise<BattleState<K>> => {
  const val = useBattleStore.getState().setStateMachine(kind, state);

  if (val.kind !== "idle" && "battleIds" in val && val.battleIds) {
    await clientApi.battle.updateState.mutate({
      battleId: val.battleIds.battleId,
      newState: convertBattleStateStringToEnum(val.kind),
    });
  }

  return val;
};

// const getState = () => useBattleStore.getState().state;

const actions: Actions = {
  async create(state, battleId, modelAId, modelBId, phoneNumber) {
    const val = await setState("createdBattle", {
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

    const newState = await createIntermediateState("preparingConvoA", {
      battleIds: state.battleIds,
      phoneNumber: state.phoneNumber,
    });
    try {
      const data = await clientApi.battle.prepareModel.mutate({
        battleId: state.battleIds.battleId,
        modelId: state.battleIds.modelAId,
        convoIndex: "A",
      });

      const finalState = await setState("preparedConvoA", {
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

    await createIntermediateState(newStateKind, {
      battleIds: state.battleIds,
      conversationId: state.conversationId,
      // @ts-expect-error
      convo: state.convo,
    });

    return switchStartConvo(state);
  },

  async moveToInProgress(state) {
    switch (state.kind) {
      case "startingCallA":
        return Ok(
          await setState("inProgressConvoA", {
            battleIds: state.battleIds,
            conversationId: state.conversationId,
            convo: state.convo,
          }),
        );
      case "startingCallB":
        return Ok(
          await setState("inProgressConvoB", {
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
  async finishConvo(state) {
    switch (state.kind) {
      case "inProgressConvoA": {
        return Ok(
          await setState("doneConvoA", {
            battleIds: state.battleIds,
            conversationId: state.conversationId,
            convo: state.convo,
            transcript: "",
          }),
        );
      }
      case "inProgressConvoB": {
        return Ok(
          await setState("doneConvoB", {
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
    const newState = await createIntermediateState("preparingConvoB", {
      battleIds: state.battleIds,
      // phoneNumber: state.phoneNumber,
    });
    try {
      const data = await clientApi.battle.prepareModel.mutate({
        battleId: state.battleIds.battleId,
        modelId: state.battleIds.modelBId,
        convoIndex: "B",
      });

      const finalState = await setState("preparedConvoB", {
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

  async moveToVoting(state) {
    return Ok(
      await setState("done", {
        battleIds: state.battleIds,
      }),
    );
  },

  async moveToDone(state) {
    return Ok(
      await setState("done", {
        battleIds: state.battleIds,
      }),
    );
  },

  async moveToError(state, error: string) {
    const battleIds = "battleIds" in state ? state.battleIds : undefined;
    return Ok(
      await setState("error", {
        battleIds: battleIds,
        prevState: state.kind,
        error,
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
    return wrapPromiseWithError(
      actions.create(
        getState<"idle">(),
        battleId,
        modelAId,
        modelBId,
        phoneNumber,
      ),
      "Error creating battle",
    );
  },

  start: () => {
    return wrapPromiseWithError(
      actions.start(getState<"createdBattle">()),
      "Error starting conversation",
    );
  },
  startConvo: () => {
    return wrapPromiseWithError(
      actions.startConvo(getState<"preparedConvoA" | "preparedConvoB">()),
      "Error starting conversation",
    );
  },
  finishConvo: (_earlyEnd?: boolean) => {
    return wrapPromiseWithError(
      actions.finishConvo(getState<"inProgressConvoA" | "inProgressConvoB">()),
      "Error finishing conversation",
    );
  },

  nextConvo: () => {
    return wrapPromiseWithError(
      actions.nextConvo(getState<"doneConvoA">()),
      "Error starting next conversation",
    );
  },

  moveToVoting: () => {
    return wrapPromiseWithError(
      actions.moveToVoting(getState<"doneConvoB">()),
      "Error moving to voting",
    );
  },

  moveToDone: () => {
    return wrapPromiseWithError(
      actions.moveToDone(getState<"voting">()),
      "Error moving to done",
    );
  },

  moveToInProgress: () => {
    return wrapPromiseWithError(
      actions.moveToInProgress(getState<"startingCallA" | "startingCallB">()),
      "Error moving to in progress",
    );
  },
};

export const Actions = wrappedActions;

const wrapPromiseWithError = async <T>(
  promise: Promise<T>,
  errorToastMsg: string,
): Promise<T> => {
  return new Promise<T>((resolve) => {
    promise
      .then((val) => {
        if (typeof val !== "object") {
          resolve(val);
          return;
        }

        if (!val) return val;

        if ("ok" in val) {
          if (!val.ok) {
            const state = getState();

            const msg = "val" in val ? (val.val as string) : "Unknown error";

            toast.error(`${errorToastMsg}: ${msg}`);

            console.error(msg);

            void actions.moveToError(state, msg);
            return;
          }

          resolve(val);
          return;
        }

        resolve(val);
      })
      .catch((e) => {
        const state = getState();

        toast.error(`${errorToastMsg}: ${e.message}`);

        console.error(e);

        return actions.moveToError(state, e.message);
      });
  });
};
