import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type {
  BattleMove,
  BattlePhase,
  BattleResult,
  BattleStarted,
  BattleState,
  BattleVariant,
} from "./types";

const initialState: BattleState = {
  phase: "idle",
  battleId: null,
  variant: null,
  opponentId: null,
  countdown: null,
  started: null,
  moves: [],
  result: null,
  matchmakingPosition: null,
  error: null,
};

const battleSlice = createSlice({
  name: "battle",
  initialState,

  reducers: {
    startMatching(state, action: PayloadAction<BattleVariant>) {
      state.phase = "matching";
      state.variant = action.payload;
      state.error = null;
      state.battleId = null;
      state.opponentId = null;
      state.countdown = null;
      state.started = null;
      state.result = null;
      state.moves = [];
      state.matchmakingPosition = 1;
    },

    setMatchmakingPosition(state, action: PayloadAction<number>) {
      state.matchmakingPosition = action.payload;
    },

    setMatched(
      state,
      action: PayloadAction<{
        battleId: string;
        opponentId: string;
      }>,
    ) {
      state.phase = "ready";
      state.battleId = action.payload.battleId;
      state.opponentId = action.payload.opponentId;
    },

    setCountdown(state, action: PayloadAction<number>) {
      state.phase = "countdown";
      state.countdown = action.payload;
    },

    setBattleStarted(state, action: PayloadAction<BattleStarted>) {
      state.phase = "playing";
      state.started = action.payload;
      state.battleId = action.payload.battleId;
      state.countdown = null;
      state.moves = [];
      state.error = null;
    },

    addMove(state, action: PayloadAction<BattleMove>) {
      state.moves.push(action.payload);
    },

    setBattleResult(state, action: PayloadAction<BattleResult>) {
      state.phase = "finished";
      state.result = action.payload;
    },

    setBattleError(state, action: PayloadAction<string>) {
      state.phase = "error";
      state.error = action.payload;
    },

    resetBattle(state) {
      state.phase = "idle";
      state.battleId = null;
      state.variant = null;
      state.opponentId = null;
      state.countdown = null;
      state.started = null;
      state.moves = [];
      state.result = null;
      state.matchmakingPosition = null;
      state.error = null;
    },
  },
});

export const {
  startMatching,
  setMatchmakingPosition,
  setMatched,
  setCountdown,
  setBattleStarted,
  addMove,
  setBattleResult,
  setBattleError,
  resetBattle,
} = battleSlice.actions;

export default battleSlice.reducer;
