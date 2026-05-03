import { createAsyncThunk } from "@reduxjs/toolkit";

import { productsApi } from "../../services/api";

export const fetchProducts = createAsyncThunk(
  "sneakyState/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      return await productsApi.getProducts();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch products";
      return rejectWithValue(message);
    }
  },
);
