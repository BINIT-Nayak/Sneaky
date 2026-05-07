import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import { getRejectedErrorMessage } from "../../utils/errorMessages";
import { addWishlistItem } from "../fetchAPI/addWishlistItem";
import { deleteWishlistItem } from "../fetchAPI/deleteWishlistItem";
import { fetchProducts } from "../fetchAPI/fetchProducts";
import { fetchWishlist } from "../fetchAPI/fetchWishlist";
import type { UIStateProps } from "../types";

const initialState: UIStateProps = {
  isAuthModalOpen: false,
  isLoggedIn: false,
  products: [],
  productsLoading: false,
  productsError: null,
  wishlist: [],
  wishlistStatus: "idle",
  wishlistLoading: false,
  wishlistError: null,
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
    resetWishlistState: (state) => {
      state.wishlist = [];
      state.wishlistStatus = "idle";
      state.wishlistLoading = false;
      state.wishlistError = null;
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
        state.productsError = getRejectedErrorMessage(
          action.payload,
          action.error.message,
          "We couldn't load products. Please try again.",
        );
      })

      .addCase(fetchWishlist.pending, (state) => {
        state.wishlistStatus = "loading";
        state.wishlistLoading = true;
        state.wishlistError = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.wishlistStatus = "succeeded";
        state.wishlistLoading = false;
        state.wishlist = action.payload;
        state.wishlistError = null;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.wishlistStatus = "failed";
        state.wishlistLoading = false;
        state.wishlistError = getRejectedErrorMessage(
          action.payload,
          action.error.message,
          "We couldn't load your wishlist. Please try again.",
        );
      })
      .addCase(addWishlistItem.fulfilled, (state) => {
        state.wishlistStatus = "idle";
      })
      .addCase(deleteWishlistItem.fulfilled, (state, action) => {
        state.wishlist = state.wishlist.filter(
          (item) => item.productId !== action.payload,
        );
      });
  },
});

export const sneakyStateActions = sneakySlice.actions;
