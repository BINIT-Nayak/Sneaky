import type {
  ICartItem,
  IWishlistItem,
  IAddToWishlistRequestProp,
} from "../store/types";

import { apiRequest } from "./api";

export const wishlistApi = {
  getWishlist: () =>
    apiRequest<IWishlistItem[]>("/api/wishlist", {
      auth: true,
    }),

  addToWishlist: (payload: IAddToWishlistRequestProp) =>
    apiRequest<void>("/api/wishlist", {
      auth: true,
      method: "POST",
      body: payload,
    }),

  removeFromWishlist: (productId: string) =>
    apiRequest<void>(`/api/wishlist/${productId}`, {
      auth: true,
      method: "DELETE",
    }),

  moveToCart: (productId: string) =>
    apiRequest<ICartItem>(`/api/wishlist/${productId}/move-to-cart`, {
      auth: true,
      method: "POST",
    }),

  clearWishlist: () =>
    apiRequest<void>("/api/wishlist", {
      auth: true,
      method: "DELETE",
    }),
};
