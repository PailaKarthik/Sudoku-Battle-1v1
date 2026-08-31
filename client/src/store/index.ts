import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import battleReducer from "../features/battle/battleSlice";
import friendsReducer from "../features/friends/friendsSlice";
import userReducer from "../features/user/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    battle: battleReducer,
    friends: friendsReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
