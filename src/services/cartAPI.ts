import type {
  IAddToCartRequestProp,
  ICartItem,
  IUpdateCartQuantityRequestProp,
} from "../store/types";

import { apiRequest } from "./api";

export const cartApi = {
  getCart: () =>
    apiRequest<ICartItem[]>("/api/cart", {
      auth: true,
    }),

  addToCart: (payload: IAddToCartRequestProp) =>
    apiRequest<ICartItem>("/api/cart", {
      auth: true,
      method: "POST",
      body: payload,
    }),

  updateQuantity: ({ productId, quantity }: IUpdateCartQuantityRequestProp) =>
    apiRequest<ICartItem>(`/api/cart/${productId}`, {
      auth: true,
      method: "PATCH",
      body: { quantity },
    }),

  removeFromCart: (productId: string) =>
    apiRequest<void>(`/api/cart/${productId}`, {
      auth: true,
      method: "DELETE",
    }),

  clearCart: () =>
    apiRequest<void>("/api/cart", {
      auth: true,
      method: "DELETE",
    }),
};
