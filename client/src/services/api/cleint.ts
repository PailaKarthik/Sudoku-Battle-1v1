import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "sudoku_battle.access_token";

const REFRESH_TOKEN_KEY = "sudoku_battle.refresh_token";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export async function saveTokens(accessToken: string, refreshToken: string) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken() {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    throw new Error("Refresh token is missing");
  }

  const response = await axios.post<{
    accessToken: string;
    refreshToken: string;
  }>(`${API_URL}/auth/refresh`, {
    refreshToken,
  });

  await saveTokens(response.data.accessToken, response.data.refreshToken);

  return response.data.accessToken;
}

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const request = error.config as RetryableRequest | undefined;

    if (!request || error.response?.status !== 401 || request._retry) {
      return Promise.reject(error);
    }

    request._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    try {
      const token = await refreshPromise;

      request.headers.Authorization = `Bearer ${token}`;

      return api(request);
    } catch (refreshError) {
      await clearTokens();

      return Promise.reject(refreshError);
    }
  },
);
