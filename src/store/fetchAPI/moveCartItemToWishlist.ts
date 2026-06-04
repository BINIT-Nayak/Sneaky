import { createAsyncThunk } from "@reduxjs/toolkit";

import { cartApi } from "../../services/cartAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";

export const moveCartItemToWishlist = createAsyncThunk(
  "sneakyState/moveCartItemToWishlist",
  async (productId: string, { rejectWithValue }) => {
    try {
      const wishlistItem = await cartApi.moveToWishlist(productId);
      return { productId, wishlistItem };
    } catch (err) {
      return rejectWithValue(
        getUserFriendlyErrorMessage(
          err,
          "We couldn't move this item to your wishlist. Please try again.",
        ),
      );
    }
  },
);
