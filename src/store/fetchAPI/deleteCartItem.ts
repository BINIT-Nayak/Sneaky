import { createAsyncThunk } from "@reduxjs/toolkit";

import { cartApi } from "../../services/cartAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";

export const deleteCartItem = createAsyncThunk(
  "sneakyState/deleteCartItem",
  async (productId: string, { rejectWithValue }) => {
    try {
      await cartApi.removeFromCart(productId);
      return productId;
    } catch (err) {
      return rejectWithValue(
        getUserFriendlyErrorMessage(
          err,
          "We couldn't remove this item from your cart. Please try again.",
        ),
      );
    }
  },
);
