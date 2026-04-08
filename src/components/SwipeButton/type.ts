export const SwipeButtonType = {
  LIKE: "Like",
  DISLIKE: "Nope",
  CART: "Cart",
} as const;

export type SwipeButtonType =
  (typeof SwipeButtonType)[keyof typeof SwipeButtonType];
