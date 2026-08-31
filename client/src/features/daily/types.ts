export type DailyVariant = "2x3" | "3x3";

export type DailyPuzzle = {
  puzzleId: string;

  variant: "TWO_BY_THREE" | "THREE_BY_THREE";

  puzzle: string;

  difficulty: string;

  difficultyScore: number;

  clueCount: number;

  estimatedSolveTime: number;
};

export type DailyAttemptSummary = {
  completionTimeMs: number;
  completedAt: string;
};

export type DailyChallenge = {
  id: string;

  challengeDate: string;

  variant: "TWO_BY_THREE" | "THREE_BY_THREE";

  puzzle: DailyPuzzle;

  completed: boolean;

  attempt: DailyAttemptSummary | null;
};

export type DailyLeaderboardEntry = {
  rank: number;

  user: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };

  completionTimeMs: number;

  completedAt: string;

  isCurrentUser: boolean;
};

export type DailyState = {
  challenge: DailyChallenge | null;

  leaderboard: DailyLeaderboardEntry[];

  leaderboardScope: "global" | "friends";

  loading: boolean;

  submitting: boolean;

  error: string | null;
};
