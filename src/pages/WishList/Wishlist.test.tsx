import { useDispatch } from "react-redux";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthContext } from "../../context/AuthContext";
import { useSneakyStateSlice } from "../../store/sneakyState/sneakySelectors";

import { Wishlist } from "./Wishlist";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
}));

jest.mock("../../store/sneakyState/sneakySelectors", () => ({
  useSneakyStateSlice: {
    getWishlist: jest.fn(),
    getWishlistLoading: jest.fn(),
    getWishlistStatus: jest.fn(),
    getWishlistError: jest.fn(),
  },
}));

const mockedUseDispatch = jest.mocked(useDispatch);
const mockedSelectors = jest.mocked(useSneakyStateSlice);

const renderWishlist = (isLoggedIn = true, onOpenAuth = jest.fn()) =>
  render(
    <AuthContext.Provider
      value={{
        isLoggedIn,
        onOpenAuth,
        onLogout: jest.fn(),
        onUserUpdate: jest.fn(),
        user: isLoggedIn
          ? { userId: "user-1", email: "mina@example.com", name: "Mina" }
          : null,
      }}
    >
      <Wishlist />
    </AuthContext.Provider>,
  );

describe("Wishlist", () => {
  beforeEach(() => {
    mockedUseDispatch.mockReturnValue(jest.fn(() => ({
      unwrap: jest.fn().mockResolvedValue(undefined),
    })) as never);
    mockedSelectors.getWishlist.mockReturnValue([]);
    mockedSelectors.getWishlistLoading.mockReturnValue(false);
    mockedSelectors.getWishlistStatus.mockReturnValue("succeeded");
    mockedSelectors.getWishlistError.mockReturnValue(null);
  });

  it("prompts guests to sign in", async () => {
    const onOpenAuth = jest.fn();

    renderWishlist(false, onOpenAuth);
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));

    expect(screen.getByText(/wishlist is waiting/i)).toBeInTheDocument();
    expect(onOpenAuth).toHaveBeenCalledTimes(1);
  });

  it("renders wishlist items from redux and deletes through dispatch", async () => {
    const dispatch = jest.fn(() => ({
      unwrap: jest.fn().mockResolvedValue(undefined),
    }));
    mockedUseDispatch.mockReturnValue(dispatch as never);
    mockedSelectors.getWishlist.mockReturnValue([
      {
        productId: "product-1",
        name: "Air Max",
        price: 12999,
        imageUrl: "image.jpg",
        brandName: "Nike",
        sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
        colors: [
          { name: "Black", value: "#17151d" },
          { name: "Ivory", value: "#eee4cf" },
          { name: "Clay", value: "#c27a58" },
        ],
        stockStatus: "In stock",
      },
    ]);

    renderWishlist();
    await userEvent.click(
      screen.getByRole("button", { name: /delete air max/i }),
    );

    expect(screen.getByText("Air Max")).toBeInTheDocument();
    expect(screen.getByText("Nike")).toBeInTheDocument();
    expect(screen.getByText("UK 6, UK 7, UK 8, UK 9, UK 10")).toBeInTheDocument();
    expect(screen.getByText("Colors: Black, Ivory, Clay")).toBeInTheDocument();
    await waitFor(() => expect(dispatch).toHaveBeenCalled());
  });

  it("adds wishlist items to the cart", async () => {
    const dispatch = jest.fn(() => ({
      unwrap: jest.fn().mockResolvedValue(undefined),
    }));
    mockedUseDispatch.mockReturnValue(dispatch as never);
    mockedSelectors.getWishlist.mockReturnValue([
      {
        productId: "product-1",
        name: "Air Max",
        price: 12999,
        imageUrl: "image.jpg",
        brandName: "Nike",
      },
    ]);

    renderWishlist();
    await userEvent.click(
      screen.getByRole("button", { name: /add to cart/i }),
    );

    expect(screen.getByText(/moved closer to checkout/i)).toBeInTheDocument();
    await waitFor(() => expect(dispatch).toHaveBeenCalled());
  });
});
