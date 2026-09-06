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
import { fetchProfileSummary } from "../fetchAPI/fetchProfileSummary";
import { fetchWishlist } from "../fetchAPI/fetchWishlist";
import { moveCartItemToWishlist } from "../fetchAPI/moveCartItemToWishlist";
import { moveWishlistItemToCart } from "../fetchAPI/moveWishlistItemToCart";
import { updateCartQuantity } from "../fetchAPI/updateCartQuantity";
import type { ICartItem, IWishlistItem, UIStateProps } from "../types";

const RECENT_PROFILE_WISHLIST_LIMIT = 10;

const wishlistItemFromProduct = (
  product: UIStateProps["products"][number],
): IWishlistItem => ({
  productId: product.id,
  name: product.name,
  price: product.price,
  imageUrl: product.image,
  brandName: product.brand,
  category: product.category,
  sizes: product.sizes,
  colors: product.colors,
  stockStatus: product.stockStatus,
});

const addProfileWishlistItem = (
  state: UIStateProps,
  wishlistItem: IWishlistItem,
) => {
  if (state.profileSummaryStatus !== "succeeded" || !state.profileSummary) {
    return;
  }

  const alreadyCounted = state.profileSummary.recentWishlist.some(
    (item) => item.productId === wishlistItem.productId,
  );

  if (!alreadyCounted) {
    state.profileSummary.wishlistCount += 1;
  }

  state.profileSummary.recentWishlist = [
    wishlistItem,
    ...state.profileSummary.recentWishlist.filter(
      (item) => item.productId !== wishlistItem.productId,
    ),
  ].slice(0, RECENT_PROFILE_WISHLIST_LIMIT);
};

const removeProfileWishlistItem = (state: UIStateProps, productId: string) => {
  if (state.profileSummaryStatus !== "succeeded" || !state.profileSummary) {
    return;
  }

  state.profileSummary.wishlistCount = Math.max(
    0,
    state.profileSummary.wishlistCount - 1,
  );
  state.profileSummary.recentWishlist =
    state.profileSummary.recentWishlist.filter(
      (item) => item.productId !== productId,
    );
};

const replaceProfileCartItemQuantity = (
  state: UIStateProps,
  nextItem: ICartItem,
  fallbackDelta = nextItem.quantity,
) => {
  if (state.profileSummaryStatus !== "succeeded" || !state.profileSummary) {
    return;
  }

  const previousItem = state.cart.find(
    (item) => item.productId === nextItem.productId,
  );
  state.profileSummary.cartCount +=
    previousItem === undefined
      ? fallbackDelta
      : nextItem.quantity - previousItem.quantity;
};

const removeProfileCartItem = (state: UIStateProps, productId: string) => {
  if (state.profileSummaryStatus !== "succeeded" || !state.profileSummary) {
    return;
  }

  const previousItem = state.cart.find((item) => item.productId === productId);
  state.profileSummary.cartCount = Math.max(
    0,
    state.profileSummary.cartCount - (previousItem?.quantity ?? 0),
  );
};

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
  profileSummary: null,
  profileSummaryStatus: "idle",
  profileSummaryLoading: false,
  profileSummaryError: null,
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
    hydrateProductsFromCache: (
      state,
      action: PayloadAction<UIStateProps["products"]>,
    ) => {
      if (state.products.length === 0) {
        state.products = action.payload;
      }
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
    resetProfileSummaryState: (state) => {
      state.profileSummary = null;
      state.profileSummaryStatus = "idle";
      state.profileSummaryLoading = false;
      state.profileSummaryError = null;
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
        if (
          action.meta?.arg?.forceRefresh &&
          !action.meta.arg.excludeProductIds?.length
        ) {
          state.products = action.payload;
          state.productsError = null;
          return;
        }

        const existingProductIds = new Set(
          state.products.map((product) => product.id),
        );
        const newProducts = action.payload.filter(
          (product) => !existingProductIds.has(product.id),
        );

        state.products =
          state.products.length === 0
            ? action.payload
            : [...state.products, ...newProducts];
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
        if (
          state.profileSummaryStatus === "succeeded" &&
          state.profileSummary
        ) {
          state.profileSummary.wishlistCount = action.payload.length;
          state.profileSummary.recentWishlist = action.payload.slice(
            0,
            RECENT_PROFILE_WISHLIST_LIMIT,
          );
        }
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
      .addCase(addWishlistItem.fulfilled, (state, action) => {
        const productId = action.payload;
        const product = state.products.find((item) => item.id === productId);

        if (!product || state.wishlistStatus !== "succeeded") {
          state.wishlistStatus = "idle";
          if (product) {
            addProfileWishlistItem(state, wishlistItemFromProduct(product));
          }
          return;
        }

        const wishlistItem = wishlistItemFromProduct(product);
        state.wishlist = state.wishlist.filter(
          (item) => item.productId !== productId,
        );
        state.wishlist.unshift(wishlistItem);
        state.wishlistStatus = "succeeded";
        addProfileWishlistItem(state, wishlistItem);
      })
      .addCase(deleteWishlistItem.fulfilled, (state, action) => {
        state.wishlist = state.wishlist.filter(
          (item) => item.productId !== action.payload,
        );
        removeProfileWishlistItem(state, action.payload);
      })
      .addCase(clearWishlistItems.fulfilled, (state) => {
        state.wishlist = [];
        if (
          state.profileSummaryStatus === "succeeded" &&
          state.profileSummary
        ) {
          state.profileSummary.wishlistCount = 0;
          state.profileSummary.recentWishlist = [];
        }
      })
      .addCase(moveCartItemToWishlist.fulfilled, (state, action) => {
        const { productId, wishlistItem } = action.payload;

        removeProfileCartItem(state, productId);
        state.cart = state.cart.filter((item) => item.productId !== productId);
        addProfileWishlistItem(state, wishlistItem);

        if (state.wishlistStatus !== "succeeded") {
          state.wishlistStatus = "idle";
          return;
        }

        const index = state.wishlist.findIndex(
          (item) => item.productId === wishlistItem.productId,
        );

        if (index >= 0) {
          state.wishlist.splice(index, 1);
        }

        state.wishlist.unshift(wishlistItem);
        state.wishlistStatus = "succeeded";
      })
      .addCase(moveWishlistItemToCart.fulfilled, (state, action) => {
        const { cartItem, productId } = action.payload;
        replaceProfileCartItemQuantity(state, cartItem, 1);
        removeProfileWishlistItem(state, productId);
        const index = state.cart.findIndex(
          (item) => item.productId === cartItem.productId,
        );

        state.wishlist = state.wishlist.filter(
          (item) => item.productId !== productId,
        );

        if (index >= 0) {
          state.cart.splice(index, 1);
        }

        state.cart.unshift(cartItem);
        state.cartStatus = "succeeded";
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
        replaceProfileCartItemQuantity(
          state,
          nextItem,
          action.meta.arg.quantity ?? 1,
        );
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
        replaceProfileCartItemQuantity(state, nextItem);
        const index = state.cart.findIndex(
          (item) => item.productId === nextItem.productId,
        );

        if (index >= 0) {
          state.cart[index] = nextItem;
        }
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        removeProfileCartItem(state, action.payload);
        state.cart = state.cart.filter(
          (item) => item.productId !== action.payload,
        );
      })
      .addCase(clearCartItems.fulfilled, (state) => {
        state.cart = [];
        if (
          state.profileSummaryStatus === "succeeded" &&
          state.profileSummary
        ) {
          state.profileSummary.cartCount = 0;
        }
      })

      .addCase(fetchProfileSummary.pending, (state) => {
        state.profileSummaryStatus = "loading";
        state.profileSummaryLoading = true;
        state.profileSummaryError = null;
      })
      .addCase(fetchProfileSummary.fulfilled, (state, action) => {
        state.profileSummaryStatus = "succeeded";
        state.profileSummaryLoading = false;
        state.profileSummary = action.payload;
        state.profileSummaryError = null;
      })
      .addCase(fetchProfileSummary.rejected, (state, action) => {
        state.profileSummaryStatus = "failed";
        state.profileSummaryLoading = false;
        state.profileSummaryError = getRejectedErrorMessage(
          action.payload,
          action.error.message,
          "We couldn't load your profile activity.",
        );
      });
  },
});

export const sneakyStateActions = sneakySlice.actions;
