import { configureStore } from "@reduxjs/toolkit";
import { sneakySlice } from "./sneakySlice";

export const store = configureStore({
  reducer: {
    [sneakySlice.name]: sneakySlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
