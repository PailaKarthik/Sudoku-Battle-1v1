import { api } from "./cleint";

import type { UserProfile } from "../../features/user/types";

export type ProfilePayload = {
  username: string;
  displayName: string;
};

export async function getMyProfile(): Promise<UserProfile> {
  const response = await api.get<UserProfile>("/users/me");

  return response.data;
}

export async function updateMyProfile(
  payload: ProfilePayload,
): Promise<UserProfile> {
  const response = await api.patch<UserProfile>("/users/me", payload);

  return response.data;
}

export async function searchUsers(query: string) {
  const response = await api.get("/users/search", {
    params: {
      query,
    },
  });

  return response.data;
}
