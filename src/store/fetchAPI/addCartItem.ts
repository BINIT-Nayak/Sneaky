import { createAsyncThunk } from "@reduxjs/toolkit";

import { cartApi } from "../../services/cartAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import type { IAddToCartRequestProp } from "../types";

export const addCartItem = createAsyncThunk(
  "sneakyState/addCartItem",
  async (payload: IAddToCartRequestProp, { rejectWithValue }) => {
    try {
      return await cartApi.addToCart(payload);
    } catch (err) {
      return rejectWithValue(
        getUserFriendlyErrorMessage(
          err,
          "We couldn't add this item to your cart. Please try again.",
        ),
      );
    }
  },
);
