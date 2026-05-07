import { createAsyncThunk } from "@reduxjs/toolkit";

import { productsApi } from "../../services/productsAPI";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";

export const fetchProducts = createAsyncThunk(
  "sneakyState/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      return await productsApi.getProducts();
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
