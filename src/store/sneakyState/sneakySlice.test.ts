const mockThunk = (type: string) => ({
  fulfilled: { type: `${type}/fulfilled` },
  pending: { type: `${type}/pending` },
  rejected: { type: `${type}/rejected` },
});

jest.mock("../fetchAPI/addCartItem", () => ({
  addCartItem: mockThunk("sneakyState/addCartItem"),
}));
jest.mock("../fetchAPI/addWishlistItem", () => ({
  addWishlistItem: mockThunk("sneakyState/addWishlistItem"),
}));
jest.mock("../fetchAPI/clearCartItems", () => ({
  clearCartItems: mockThunk("sneakyState/clearCartItems"),
}));
jest.mock("../fetchAPI/clearWishlistItems", () => ({
  clearWishlistItems: mockThunk("sneakyState/clearWishlistItems"),
}));
jest.mock("../fetchAPI/deleteCartItem", () => ({
  deleteCartItem: mockThunk("sneakyState/deleteCartItem"),
}));
jest.mock("../fetchAPI/deleteWishlistItem", () => ({
  deleteWishlistItem: mockThunk("sneakyState/deleteWishlistItem"),
}));
jest.mock("../fetchAPI/fetchCart", () => ({
  fetchCart: mockThunk("sneakyState/fetchCart"),
}));
jest.mock("../fetchAPI/fetchProducts", () => ({
  fetchProducts: mockThunk("sneakyState/fetchProducts"),
}));
jest.mock("../fetchAPI/fetchWishlist", () => ({
  fetchWishlist: mockThunk("sneakyState/fetchWishlist"),
}));
jest.mock("../fetchAPI/moveWishlistItemToCart", () => ({
  moveWishlistItemToCart: mockThunk("sneakyState/moveWishlistItemToCart"),
}));
jest.mock("../fetchAPI/updateCartQuantity", () => ({
  updateCartQuantity: mockThunk("sneakyState/updateCartQuantity"),
}));

import { sneakySlice } from "./sneakySlice";

describe("sneakySlice", () => {
  it("moves newly liked loaded products to the top of an already-loaded wishlist", () => {
    const initialState = {
      ...sneakySlice.reducer(undefined, { type: "init" }),
      products: [
        {
          id: "product-1",
          name: "Air Max",
          price: 12999,
          image: "image.jpg",
          description: "Comfortable sneakers",
          brand: "Nike",
          category: "Running",
        },
      ],
      wishlist: [
        {
          productId: "product-2",
          name: "Forum Low",
          price: 9999,
          imageUrl: "forum.jpg",
          brandName: "Adidas",
          category: "Lifestyle",
        },
      ],
      wishlistStatus: "succeeded" as const,
    };

    const nextState = sneakySlice.reducer(
      initialState,
      {
        payload: "product-1",
        type: "sneakyState/addWishlistItem/fulfilled",
      },
    );

    expect(nextState.wishlist).toHaveLength(2);
    expect(nextState.wishlist[0]).toMatchObject({
      productId: "product-1",
      name: "Air Max",
      imageUrl: "image.jpg",
      brandName: "Nike",
    });
    expect(nextState.wishlist[1].productId).toBe("product-2");
    expect(nextState.wishlistStatus).toBe("succeeded");
  });

  it("invalidates wishlist when liked product is not present in loaded products", () => {
    const initialState = {
      ...sneakySlice.reducer(undefined, { type: "init" }),
      wishlistStatus: "succeeded" as const,
    };

    const nextState = sneakySlice.reducer(
      initialState,
      {
        payload: "product-1",
        type: "sneakyState/addWishlistItem/fulfilled",
      },
    );

    expect(nextState.wishlistStatus).toBe("idle");
  });
});
