import { api } from "./cleint";

import type {
  DailyChallenge,
  DailyLeaderboardEntry,
} from "../../features/daily/types";

export type DailyAttemptResult = {
  id: string;
  challengeId: string;
  userId: string;
  completionTimeMs: number;
  completedAt: string;
};

export async function getTodayDaily(
  variant: "2x3" | "3x3",
): Promise<DailyChallenge> {
  const response = await api.get<DailyChallenge>("/daily/today", {
    params: {
      variant,
    },
  });

  return response.data;
}

export async function submitDailyAttempt(
  challengeId: string,
  completionTimeMs: number,
  board: number[][],
): Promise<DailyAttemptResult> {
  if (!challengeId) {
    throw new Error("Daily challenge ID is missing.");
  }

  if (!Number.isInteger(completionTimeMs) || completionTimeMs <= 0) {
    throw new Error("Invalid completion time.");
  }

  if (board.length !== 6 || board.some((row) => row.length !== 6)) {
    throw new Error("Invalid 6×6 Sudoku board.");
  }

  console.log("[Daily API] POST attempt", {
    challengeId,
    completionTimeMs,
    board,
  });

  const response = await api.post<DailyAttemptResult>(
    `/daily/${challengeId}/attempt`,
    {
      completionTimeMs,
      board,
    },
  );

  console.log("[Daily API] POST attempt success", response.data);

  return response.data;
}

export async function getDailyLeaderboard(
  challengeId: string,
  scope: "global" | "friends",
): Promise<DailyLeaderboardEntry[]> {
  const response = await api.get<DailyLeaderboardEntry[]>(
    `/daily/${challengeId}/leaderboard`,
    {
      params: {
        scope,
      },
    },
  );

  return response.data;
}
