import { api } from "./cleint";

export type BattleInvite = {
  id: string;

  senderId: string;
  receiverId: string;

  variant: "TWO_BY_THREE" | "THREE_BY_THREE";

  status: "PENDING" | "ACCEPTED" | "DECLINED";

  createdAt: string;
  respondedAt: string | null;

  sender: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  };
};

export type RecentBattle = {
  id: string;

  variant: "2×3" | "3×3";

  result: "win" | "loss" | "draw";

  opponent: {
    id: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;

  completionTimeMs: number | null;

  ratingChange: number | null;

  ratingAfter: number | null;

  finishedAt: string | null;
};

export async function getBattleInvites(): Promise<BattleInvite[]> {
  const response = await api.get<BattleInvite[]>("/battles/invites");

  return response.data;
}

export async function sendBattleInvite(
  receiverId: string,
  variant: "2x3" | "3x3",
) {
  const response = await api.post("/battles/invites", {
    receiverId,
    variant,
  });

  return response.data;
}

export async function acceptBattleInvite(inviteId: string) {
  const response = await api.post(`/battles/invites/${inviteId}/accept`);

  return response.data;
}

export async function declineBattleInvite(inviteId: string) {
  const response = await api.post(`/battles/invites/${inviteId}/decline`);

  return response.data;
}

export async function getBattle(battleId: string) {
  const response = await api.get(`/battles/${battleId}`);

  return response.data;
}

export async function getBattleResult(battleId: string) {
  const response = await api.get(`/battles/${battleId}/result`);

  return response.data;
}

export async function getRecentBattles(): Promise<RecentBattle[]> {
  const response = await api.get<RecentBattle[]>("/battles/recent");

  return response.data;
}
