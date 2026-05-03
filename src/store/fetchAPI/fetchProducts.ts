import { createAsyncThunk } from "@reduxjs/toolkit";

import type { Product } from "../../samples/product";

export const fetchProducts = createAsyncThunk(
  "sneakyState/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data as Product[];
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch products";
      return rejectWithValue(message);
    }
  },
);
