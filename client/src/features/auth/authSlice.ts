import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { AuthResponse, AuthState, AuthUser } from "./types";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  initialized: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    authStarted(state) {
      state.loading = true;
      state.error = null;
    },

    setAuth(state, action: PayloadAction<AuthResponse>) {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },

    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },

    setAuthError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    setInitialized(state, action: PayloadAction<boolean>) {
      state.initialized = action.payload;
    },

    clearAuth(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  authStarted,
  setAuth,
  setUser,
  setAuthError,
  setInitialized,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;
