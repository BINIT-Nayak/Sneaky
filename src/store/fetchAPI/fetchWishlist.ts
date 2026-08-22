import { createAsyncThunk } from "@reduxjs/toolkit";

import { wishlistApi } from "../../services/wishlistAPI";
import type { IWishlistItem } from "../../store/types";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import type { UIStateProps } from "../types";

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
  {
    condition: (_, { getState }) => {
      const { sneakyState } = getState() as { sneakyState: UIStateProps };
      return sneakyState.wishlistStatus === "idle";
    },
  },
);
