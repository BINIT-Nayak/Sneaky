import { createAsyncThunk } from "@reduxjs/toolkit";

import { productsApi } from "../../services/productsAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";

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
);
