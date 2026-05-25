import { createAsyncThunk } from "@reduxjs/toolkit";

import { wishlistApi } from "../../services/wishlistAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";

export const clearWishlistItems = createAsyncThunk(
  "sneakyState/clearWishlistItems",
  async (_, { rejectWithValue }) => {
    try {
      await wishlistApi.clearWishlist();
    } catch (err) {
      return rejectWithValue(
        getUserFriendlyErrorMessage(
          err,
          "We couldn't clear your wishlist. Please try again.",
        ),
      );
    }
  },
);
