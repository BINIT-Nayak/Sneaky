import { createAsyncThunk } from "@reduxjs/toolkit";

import { productsApi } from "../../services/productsAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import type { UIStateProps } from "../types";

type FetchProductsPayload = {
  excludeProductIds?: string[];
};

export const fetchProducts = createAsyncThunk(
  "sneakyState/fetchProducts",
  async (payload: FetchProductsPayload | undefined, { rejectWithValue }) => {
    try {
      return await productsApi.getProducts(payload);
    } catch (err) {
      return rejectWithValue(
        getUserFriendlyErrorMessage(
          err,
          "We couldn't load products. Please try again.",
        ),
      );
    }
  },
  {
    condition: (payload, { getState }) => {
      const { sneakyState } = getState() as { sneakyState: UIStateProps };
      const isPrefetch = Boolean(payload?.excludeProductIds?.length);

      return !sneakyState.productsLoading && (isPrefetch || sneakyState.products.length === 0);
    },
  },
);
