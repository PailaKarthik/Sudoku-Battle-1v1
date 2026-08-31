export type BattleVariant = "2x3" | "3x3";

export type BattlePhase =
  | "idle"
  | "matching"
  | "ready"
  | "countdown"
  | "playing"
  | "finished"
  | "error";

export type BattlePlayer = {
  userId: string;
  slot: number;
  result: "WIN" | "LOSS" | "DRAW" | null;
  completionTimeMs: number | null;
  ratingBefore: number | null;
  ratingChange: number | null;
  ratingAfter: number | null;
};

export type BattleStarted = {
  battleId: string;
  variant: "TWO_BY_THREE" | "THREE_BY_THREE";
  startedAt: string | null;
  puzzle: {
    puzzleId: string;
    variant: "TWO_BY_THREE" | "THREE_BY_THREE";
    puzzle: string;
    difficulty: string;
    difficultyScore: number;
    clueCount: number;
    estimatedSolveTime: number;
  };
  players: BattlePlayer[];
};

export type BattleMove = {
  userId: string;
  row: number;
  column: number;
  value: number;
};

export type BattleResult = {
  battleId: string;
  winnerId: string;
  players: BattlePlayer[];
};

export type BattleState = {
  phase: BattlePhase;

  battleId: string | null;

  variant: BattleVariant | null;

  opponentId: string | null;

  countdown: number | null;

  started: BattleStarted | null;

  moves: BattleMove[];

  result: BattleResult | null;

  matchmakingPosition: number | null;

  error: string | null;
};
