import { createAsyncThunk } from "@reduxjs/toolkit";

import { wishlistApi } from "../../services/wishlistAPI";
import type { IWishlistItem } from "../../store/types";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";

export const fetchWishlist = createAsyncThunk(
  "sneakyState/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const items = await wishlistApi.getWishlist();
      return items satisfies IWishlistItem[];
    } catch (err) {
      return rejectWithValue(
        getUserFriendlyErrorMessage(
          err,
          "We couldn't load your wishlist. Please try again.",
        ),
      );
    }
  },
);
