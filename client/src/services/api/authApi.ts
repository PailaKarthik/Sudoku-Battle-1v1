import { api, clearTokens, getAccessToken, saveTokens } from "./cleint";

import type { AuthResponse, AuthUser } from "../../features/auth/types";

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/google", {
    idToken,
  });

  await saveTokens(response.data.accessToken, response.data.refreshToken);

  return response.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<AuthUser>("/auth/me");

  return response.data;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    await clearTokens();
  }
}

export async function hasSession() {
  return Boolean(await getAccessToken());
}
