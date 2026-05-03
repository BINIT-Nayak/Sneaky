import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import { sampleProducts } from "../../samples/product";
import { fetchProducts } from "../fetchAPI/fetchProducts";
import type { UIStateProps } from "../types";

const initialState: UIStateProps = {
  isAuthModalOpen: false,
  isLoggedIn: false,
  products: sampleProducts,
  productsLoading: false,
  productsError: null,
};

export const sneakySlice = createSlice({
  name: "sneakyState",
  initialState,
  reducers: {
    setAuthModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAuthModalOpen = action.payload;
    },
    setIsLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.products = action.payload;
        state.productsError = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.productsError = action.payload as string;
      });
  },
});

export const sneakyStateActions = sneakySlice.actions;
