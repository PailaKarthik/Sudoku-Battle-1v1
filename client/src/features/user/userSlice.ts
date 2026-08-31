import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { UserProfile, UserState } from "./types";

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",

  initialState,

  reducers: {
    setProfile(state, action: PayloadAction<UserProfile>) {
      state.profile = action.payload;
      state.loading = false;
      state.error = null;
    },

    setUserLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    setUserError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    clearProfile(state) {
      state.profile = null;
    },
  },
});

export const { setProfile, setUserLoading, setUserError, clearProfile } =
  userSlice.actions;

export default userSlice.reducer;
