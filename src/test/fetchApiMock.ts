const makeThunk = (type: string) => {
  const thunk = (payload?: unknown) => ({ payload, type });
  thunk.pending = { type: `${type}/pending` };
  thunk.fulfilled = { type: `${type}/fulfilled` };
  thunk.rejected = { type: `${type}/rejected` };
  return thunk;
};

export const addCartItem = makeThunk("sneakyState/addCartItem");
export const addWishlistItem = makeThunk("sneakyState/addWishlistItem");
export const clearCartItems = makeThunk("sneakyState/clearCartItems");
export const clearWishlistItems = makeThunk("sneakyState/clearWishlistItems");
export const deleteCartItem = makeThunk("sneakyState/deleteCartItem");
export const deleteWishlistItem = makeThunk("sneakyState/deleteWishlistItem");
export const fetchCart = makeThunk("sneakyState/fetchCart");
export const fetchProducts = makeThunk("sneakyState/fetchProducts");
export const fetchWishlist = makeThunk("sneakyState/fetchWishlist");
export const moveWishlistItemToCart = makeThunk(
  "sneakyState/moveWishlistItemToCart",
);
export const recordProductPass = makeThunk("sneakyState/recordProductPass");
export const updateCartQuantity = makeThunk("sneakyState/updateCartQuantity");
