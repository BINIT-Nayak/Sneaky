import { createAsyncThunk } from "@reduxjs/toolkit";

import { wishlistApi } from "../../services/wishlistAPI";
import type { IWishlistItem } from "../../store/types";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import type { UIStateProps } from "../types";

type FetchWishlistPayload = {
  forceRefresh?: boolean;
};

export const fetchWishlist = createAsyncThunk(
  "sneakyState/fetchWishlist",
  async (_payload: FetchWishlistPayload | undefined, { rejectWithValue }) => {
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
    condition: (payload, { getState }) => {
      const { sneakyState } = getState() as { sneakyState: UIStateProps };
      return (
        !sneakyState.wishlistLoading &&
        (payload?.forceRefresh || sneakyState.wishlistStatus === "idle")
      );
    },
  },
);
