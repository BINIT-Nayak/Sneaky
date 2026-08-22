import { createAsyncThunk } from "@reduxjs/toolkit";

import { cartApi } from "../../services/cartAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import type { ICartItem, UIStateProps } from "../types";

export const fetchCart = createAsyncThunk(
  "sneakyState/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const items = await cartApi.getCart();
      return items satisfies ICartItem[];
    } catch (err) {
      return rejectWithValue(
        getUserFriendlyErrorMessage(
          err,
          "We couldn't load your cart. Please try again.",
        ),
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { sneakyState } = getState() as { sneakyState: UIStateProps };
      return sneakyState.cartStatus === "idle";
    },
  },
);
