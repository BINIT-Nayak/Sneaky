import type { IWishlistItem, IAddToWishlistRequestProp } from "../store/types";

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
};
