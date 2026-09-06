import { createAsyncThunk } from "@reduxjs/toolkit";

import { cartApi } from "../../services/cartAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import type { ICartItem, UIStateProps } from "../types";

type FetchCartPayload = {
  forceRefresh?: boolean;
};

export const fetchCart = createAsyncThunk(
  "sneakyState/fetchCart",
  async (_payload: FetchCartPayload | undefined, { rejectWithValue }) => {
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
    condition: (payload, { getState }) => {
      const { sneakyState } = getState() as { sneakyState: UIStateProps };
      return (
        !sneakyState.cartLoading &&
        (payload?.forceRefresh || sneakyState.cartStatus === "idle")
      );
    },
  },
);
