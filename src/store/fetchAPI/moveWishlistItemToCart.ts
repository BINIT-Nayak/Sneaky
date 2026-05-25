import { createAsyncThunk } from "@reduxjs/toolkit";

import { wishlistApi } from "../../services/wishlistAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";

export const moveWishlistItemToCart = createAsyncThunk(
  "sneakyState/moveWishlistItemToCart",
  async (productId: string, { rejectWithValue }) => {
    try {
      const cartItem = await wishlistApi.moveToCart(productId);
      return { cartItem, productId };
    } catch (err) {
      return rejectWithValue(
        getUserFriendlyErrorMessage(
          err,
          "We couldn't move this item to your cart. Please try again.",
        ),
      );
    }
  },
);
