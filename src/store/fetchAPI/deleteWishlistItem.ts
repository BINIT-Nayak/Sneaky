import { createAsyncThunk } from "@reduxjs/toolkit";

import { wishlistApi } from "../../services/wishlistAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";

export const deleteWishlistItem = createAsyncThunk(
  "sneakyState/deleteWishlistItem",
  async (productId: string, { rejectWithValue }) => {
    try {
      await wishlistApi.removeFromWishlist(productId);
      return productId;
    } catch (err) {
      return rejectWithValue(
        getUserFriendlyErrorMessage(
          err,
          "We couldn't remove this item from your wishlist. Please try again.",
        ),
      );
    }
  },
);
