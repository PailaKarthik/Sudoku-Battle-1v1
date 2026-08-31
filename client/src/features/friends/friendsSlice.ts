import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { FriendRequest, FriendUser, FriendsState } from "./types";

const initialState: FriendsState = {
  friends: [],
  requests: [],
  loading: false,
  error: null,
};

const friendsSlice = createSlice({
  name: "friends",

  initialState,

  reducers: {
    setFriends(state, action: PayloadAction<FriendUser[]>) {
      state.friends = action.payload;
      state.error = null;
    },

    setRequests(state, action: PayloadAction<FriendRequest[]>) {
      state.requests = action.payload;
      state.error = null;
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },

    clearFriends(state) {
      state.friends = [];
      state.requests = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setFriends, setRequests, setLoading, setError, clearFriends } =
  friendsSlice.actions;

export default friendsSlice.reducer;
