import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import { getRejectedErrorMessage } from "../../utils/errorMessages";
import { addCartItem } from "../fetchAPI/addCartItem";
import { addWishlistItem } from "../fetchAPI/addWishlistItem";
import { clearCartItems } from "../fetchAPI/clearCartItems";
import { clearWishlistItems } from "../fetchAPI/clearWishlistItems";
import { deleteCartItem } from "../fetchAPI/deleteCartItem";
import { deleteWishlistItem } from "../fetchAPI/deleteWishlistItem";
import { fetchCart } from "../fetchAPI/fetchCart";
import { fetchProducts } from "../fetchAPI/fetchProducts";
import { fetchWishlist } from "../fetchAPI/fetchWishlist";
import { updateCartQuantity } from "../fetchAPI/updateCartQuantity";
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
  cart: [],
  cartStatus: "idle",
  cartLoading: false,
  cartError: null,
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
    resetCartState: (state) => {
      state.cart = [];
      state.cartStatus = "idle";
      state.cartLoading = false;
      state.cartError = null;
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
      })
      .addCase(clearWishlistItems.fulfilled, (state) => {
        state.wishlist = [];
      })

      .addCase(fetchCart.pending, (state) => {
        state.cartStatus = "loading";
        state.cartLoading = true;
        state.cartError = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cartStatus = "succeeded";
        state.cartLoading = false;
        state.cart = action.payload;
        state.cartError = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.cartStatus = "failed";
        state.cartLoading = false;
        state.cartError = getRejectedErrorMessage(
          action.payload,
          action.error.message,
          "We couldn't load your cart. Please try again.",
        );
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        const nextItem = action.payload;
        const index = state.cart.findIndex(
          (item) => item.productId === nextItem.productId,
        );

        if (index >= 0) {
          state.cart.splice(index, 1);
        }

        state.cart.unshift(nextItem);
        state.cartStatus = "succeeded";
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        const nextItem = action.payload;
        const index = state.cart.findIndex(
          (item) => item.productId === nextItem.productId,
        );

        if (index >= 0) {
          state.cart[index] = nextItem;
        }
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.cart = state.cart.filter(
          (item) => item.productId !== action.payload,
        );
      })
      .addCase(clearCartItems.fulfilled, (state) => {
        state.cart = [];
      });
  },
});

export const sneakyStateActions = sneakySlice.actions;
