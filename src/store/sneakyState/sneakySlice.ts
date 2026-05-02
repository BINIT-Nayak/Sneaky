import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import type { UIStateProps } from "../types";

const initialState: UIStateProps = {
  isAuthModalOpen: false,
};

export const sneakySlice = createSlice({
  name: "sneakyState",
  initialState,
  reducers: {
    setAuthModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAuthModalOpen = action.payload;
    },
  },
});

export const sneakyStateActions = sneakySlice.actions;
