import { createAsyncThunk } from "@reduxjs/toolkit";

import { wishlistApi } from "../../services/wishlistAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import type { IAddToWishlistRequestProp } from "../types";

export const addWishlistItem = createAsyncThunk(
  "sneakyState/addWishlistItem",
  async (payload: IAddToWishlistRequestProp, { rejectWithValue }) => {
    try {
      await wishlistApi.addToWishlist(payload);
      return payload.productId;
    } catch (err) {
      return rejectWithValue(
        getUserFriendlyErrorMessage(
          err,
          "We couldn't add this item to your wishlist. Please try again.",
        ),
      );
    }
  },
);
