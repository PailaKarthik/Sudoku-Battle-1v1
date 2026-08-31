import { api } from "./cleint";

import type { FriendRequest, FriendUser } from "../../features/friends/types";

export async function getFriends(): Promise<FriendUser[]> {
  const response = await api.get<FriendUser[]>("/friends");

  return response.data;
}

export async function getFriendRequests(): Promise<FriendRequest[]> {
  const response = await api.get<FriendRequest[]>("/friends/requests");

  return response.data;
}

export async function sendFriendRequest(userId: string) {
  const response = await api.post("/friends/requests", {
    userId,
  });

  return response.data;
}

export async function acceptFriendRequest(requestId: string) {
  const response = await api.patch(`/friends/requests/${requestId}/accept`);

  return response.data;
}

export async function declineFriendRequest(requestId: string) {
  const response = await api.patch(`/friends/requests/${requestId}/decline`);

  return response.data;
}

export async function removeFriend(friendId: string) {
  const response = await api.delete(`/friends/${friendId}`);

  return response.data;
}

export async function searchUsers(query: string): Promise<FriendUser[]> {
  const response = await api.get<FriendUser[]>("/users/search", {
    params: {
      query,
    },
  });

  return response.data;
}
