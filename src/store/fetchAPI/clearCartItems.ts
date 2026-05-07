import { createAsyncThunk } from "@reduxjs/toolkit";

import { cartApi } from "../../services/cartAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";

export const clearCartItems = createAsyncThunk(
  "sneakyState/clearCartItems",
  async (_, { rejectWithValue }) => {
    try {
      await cartApi.clearCart();
    } catch (err) {
      return rejectWithValue(
        getUserFriendlyErrorMessage(
          err,
          "We couldn't clear your cart. Please try again.",
        ),
      );
    }
  },
);
