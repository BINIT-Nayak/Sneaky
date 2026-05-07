import { createAsyncThunk } from "@reduxjs/toolkit";

import { cartApi } from "../../services/cartAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import type { IUpdateCartQuantityRequestProp } from "../types";

export const updateCartQuantity = createAsyncThunk(
  "sneakyState/updateCartQuantity",
  async (payload: IUpdateCartQuantityRequestProp, { rejectWithValue }) => {
    try {
      return await cartApi.updateQuantity(payload);
    } catch (err) {
      return rejectWithValue(
        getUserFriendlyErrorMessage(
          err,
          "We couldn't update this cart item. Please try again.",
        ),
      );
    }
  },
);
