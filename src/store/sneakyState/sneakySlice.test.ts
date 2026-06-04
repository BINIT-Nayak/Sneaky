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
jest.mock("../fetchAPI/moveCartItemToWishlist", () => ({
  moveCartItemToWishlist: mockThunk("sneakyState/moveCartItemToWishlist"),
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

  it("moves cart items to the top of an already-loaded wishlist", () => {
    const initialState = {
      ...sneakySlice.reducer(undefined, { type: "init" }),
      cart: [
        {
          productId: "product-1",
          name: "Air Max",
          price: 12999,
          currency: "INR",
          imageUrl: "image.jpg",
          brandName: "Nike",
          quantity: 2,
          itemTotal: 25998,
        },
      ],
      wishlist: [
        {
          productId: "product-2",
          name: "Forum Low",
          price: 9999,
          imageUrl: "forum.jpg",
          brandName: "Adidas",
        },
      ],
      wishlistStatus: "succeeded" as const,
    };

    const nextState = sneakySlice.reducer(
      initialState,
      {
        payload: {
          productId: "product-1",
          wishlistItem: {
            productId: "product-1",
            name: "Air Max",
            price: 12999,
            imageUrl: "image.jpg",
            brandName: "Nike",
          },
        },
        type: "sneakyState/moveCartItemToWishlist/fulfilled",
      },
    );

    expect(nextState.cart).toHaveLength(0);
    expect(nextState.wishlist[0]).toMatchObject({
      productId: "product-1",
      name: "Air Max",
    });
    expect(nextState.wishlist[1].productId).toBe("product-2");
  });

  it("appends new recommendation products without duplicating existing ones", () => {
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
    };

    const nextState = sneakySlice.reducer(
      initialState,
      {
        payload: [
          initialState.products[0],
          {
            id: "product-2",
            name: "Forum Low",
            price: 9999,
            image: "forum.jpg",
            description: "Retro court sneakers",
            brand: "Adidas",
            category: "Lifestyle",
          },
        ],
        type: "sneakyState/fetchProducts/fulfilled",
      },
    );

    expect(nextState.products).toHaveLength(2);
    expect(nextState.products.map((product) => product.id)).toEqual([
      "product-1",
      "product-2",
    ]);
  });
});
