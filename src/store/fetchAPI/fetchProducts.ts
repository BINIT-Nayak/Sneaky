import { createAsyncThunk } from "@reduxjs/toolkit";

import { productsApi } from "../../services/productsAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import type { Product, UIStateProps } from "../types";

type FetchProductsPayload = {
  excludeProductIds?: string[];
  forceRefresh?: boolean;
};

export const fetchProducts = createAsyncThunk<
  Product[],
  FetchProductsPayload | undefined,
  { rejectValue: string }
>(
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
      const isForcedRefresh = Boolean(payload?.forceRefresh);

      return (
        !sneakyState.productsLoading &&
        (isForcedRefresh || isPrefetch || sneakyState.products.length === 0)
      );
    },
  },
);
