import { createAsyncThunk } from "@reduxjs/toolkit";

import { productAnalyticsApi } from "../../services/productAnalyticsAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";

export const recordProductPass = createAsyncThunk(
  "sneakyState/recordProductPass",
  async (productId: string, { rejectWithValue }) => {
    try {
      await productAnalyticsApi.recordProductPass(productId);
      return productId;
    } catch (err) {
      return rejectWithValue(
        getUserFriendlyErrorMessage(
          err,
          "We couldn't record this preference. Please try again.",
        ),
      );
    }
  },
);
