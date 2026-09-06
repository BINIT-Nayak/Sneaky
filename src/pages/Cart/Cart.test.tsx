import { useDispatch } from "react-redux";

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthContext } from "../../context/AuthContext";
import { useSneakyStateSlice } from "../../store/sneakyState/sneakySelectors";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
}));

jest.mock("../../store/sneakyState/sneakySelectors", () => ({
  useSneakyStateSlice: {
    getCart: jest.fn(),
    getCartLoading: jest.fn(),
    getCartStatus: jest.fn(),
    getCartError: jest.fn(),
  },
}));

jest.mock("../../services/eventAPI", () => ({
  eventApi: {
    track: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../../store/sneakyState/sneakySlice", () => ({
  sneakyStateActions: {
    hydrateCartFromCache: jest.fn((payload?: unknown) => ({
      payload,
      type: "sneakyState/hydrateCartFromCache",
    })),
  },
}));

const { Cart } = require("./Cart") as typeof import("./Cart");

const mockedUseDispatch = jest.mocked(useDispatch);
const mockedSelectors = jest.mocked(useSneakyStateSlice);

const renderCart = (isLoggedIn = true, onOpenAuth = jest.fn()) =>
  render(
    <AuthContext.Provider
      value={{
        isAuthReady: true,
        isLoggedIn,
        onOpenAuth,
        onLogout: jest.fn(),
        onUserUpdate: jest.fn(),
        user: isLoggedIn
          ? { userId: "user-1", email: "mina@example.com", name: "Mina" }
          : null,
      }}
    >
      <Cart />
    </AuthContext.Provider>,
  );

describe("Cart", () => {
  beforeEach(() => {
    mockedUseDispatch.mockReturnValue(jest.fn(() => ({
      unwrap: jest.fn().mockResolvedValue(undefined),
    })) as never);
    mockedSelectors.getCart.mockReturnValue([]);
    mockedSelectors.getCartLoading.mockReturnValue(false);
    mockedSelectors.getCartStatus.mockReturnValue("succeeded");
    mockedSelectors.getCartError.mockReturnValue(null);
  });

  it("prompts guests to sign in", async () => {
    const onOpenAuth = jest.fn();

    renderCart(false, onOpenAuth);
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));

    expect(screen.getByText(/please log in to view your cart/i)).toBeInTheDocument();
    expect(onOpenAuth).toHaveBeenCalledTimes(1);
  });

  it("renders totals and dispatches quantity updates", async () => {
    const dispatch = jest.fn(() => ({
      unwrap: jest.fn().mockResolvedValue(undefined),
    }));
    mockedUseDispatch.mockReturnValue(dispatch as never);
    mockedSelectors.getCart.mockReturnValue([
      {
        productId: "product-1",
        name: "Air Max",
        price: 12999,
        currency: "INR",
        imageUrl: "image.jpg",
        brandName: "Nike",
        category: "Running",
        merchantName: "Amazon",
        merchantUrl: "https://www.amazon.in/s?k=sneakers",
        quantity: 2,
        itemTotal: 25998,
        sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
        colors: [
          { name: "Black", value: "#17151d" },
          { name: "Ivory", value: "#eee4cf" },
          { name: "Clay", value: "#c27a58" },
        ],
        stockStatus: "In stock",
      },
    ]);

    renderCart();
    await userEvent.click(
      screen.getByRole("button", { name: /increase air max quantity/i }),
    );

    expect(screen.getByText("My Cart (2 items)")).toBeInTheDocument();
    expect(screen.getByText("Subtotal (2 items)")).toBeInTheDocument();
    expect(screen.getByText("Delivery")).toBeInTheDocument();
    expect(screen.getByText("Sneaky discount")).toBeInTheDocument();
    expect(screen.getByText("Running")).toBeInTheDocument();
    expect(screen.getAllByText("Amazon").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /continue on amazon/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("UK 6, UK 7, UK 8, UK 9, UK 10")).toBeInTheDocument();
    expect(screen.getByText("Colors: Black, Ivory, Clay")).toBeInTheDocument();
    expect(screen.getAllByText("₹25,998").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Free").length).toBeGreaterThan(0);
    await waitFor(() => expect(dispatch).toHaveBeenCalled());
  });

  it("keeps clear cart enabled while a quantity update is pending", async () => {
    let resolveUpdate: () => void = jest.fn();
    const updatePromise = new Promise<void>((resolve) => {
      resolveUpdate = resolve;
    });
    const dispatch = jest.fn(() => ({
      unwrap: jest.fn().mockReturnValue(updatePromise),
    }));
    mockedUseDispatch.mockReturnValue(dispatch as never);
    mockedSelectors.getCart.mockReturnValue([
      {
        productId: "product-1",
        name: "Air Max",
        price: 12999,
        currency: "INR",
        imageUrl: "image.jpg",
        brandName: "Nike",
        category: "Running",
        merchantName: "Amazon",
        merchantUrl: "https://www.amazon.in/s?k=sneakers",
        quantity: 2,
        itemTotal: 25998,
      },
    ]);

    renderCart();
    await userEvent.click(
      screen.getByRole("button", { name: /increase air max quantity/i }),
    );

    expect(screen.getByRole("button", { name: "Clear Cart" })).toBeEnabled();

    await act(async () => {
      resolveUpdate();
      await updatePromise;
    });
  });

  it("moves cart items to wishlist", async () => {
    const dispatch = jest.fn(() => ({
      unwrap: jest.fn().mockResolvedValue(undefined),
    }));
    mockedUseDispatch.mockReturnValue(dispatch as never);
    mockedSelectors.getCart.mockReturnValue([
      {
        productId: "product-1",
        name: "Air Max",
        price: 12999,
        currency: "INR",
        imageUrl: "image.jpg",
        brandName: "Nike",
        category: "Running",
        merchantName: "Amazon",
        merchantUrl: "https://www.amazon.in/s?k=sneakers",
        quantity: 1,
        itemTotal: 12999,
      },
    ]);

    renderCart();
    await userEvent.click(
      screen.getByRole("button", { name: /move air max to wishlist/i }),
    );

    expect(screen.getByText(/air max moved to wishlist/i)).toBeInTheDocument();
    await waitFor(() => expect(dispatch).toHaveBeenCalled());
  });

  it("groups checkout buttons by merchant", () => {
    mockedSelectors.getCart.mockReturnValue([
      {
        productId: "product-1",
        name: "Air Max",
        price: 12999,
        currency: "INR",
        imageUrl: "image.jpg",
        brandName: "Nike",
        category: "Running",
        merchantName: "Amazon",
        merchantUrl: "https://www.amazon.in/s?k=sneakers",
        quantity: 1,
        itemTotal: 12999,
      },
      {
        productId: "product-2",
        name: "Classic Wave",
        price: 8999,
        currency: "INR",
        imageUrl: "classic.jpg",
        brandName: "New Balance",
        category: "Lifestyle",
        merchantName: "Amazon",
        merchantUrl: "https://www.amazon.in/s?k=sneakers",
        quantity: 2,
        itemTotal: 17998,
      },
      {
        productId: "product-3",
        name: "Gel Lyte",
        price: 10999,
        currency: "INR",
        imageUrl: "gel.jpg",
        brandName: "Asics",
        category: "Running",
        merchantName: "Myntra",
        merchantUrl: "https://www.myntra.com/sneakers",
        quantity: 1,
        itemTotal: 10999,
      },
    ]);

    renderCart();

    expect(
      screen.getByRole("button", { name: /continue on amazon/i }),
    ).toHaveTextContent("3 items");
    expect(
      screen.getByRole("button", { name: /continue on myntra/i }),
    ).toHaveTextContent("1 item");
    expect(
      screen.queryByRole("button", { name: /proceed/i }),
    ).not.toBeInTheDocument();
  });

  it("opens the selected merchant", async () => {
    const openSpy = jest.spyOn(window, "open").mockImplementation(jest.fn());

    mockedSelectors.getCart.mockReturnValue([
      {
        productId: "product-1",
        name: "Air Max",
        price: 12999,
        currency: "INR",
        imageUrl: "image.jpg",
        brandName: "Nike",
        category: "Running",
        merchantName: "Amazon",
        merchantUrl: "https://www.amazon.in/s?k=sneakers",
        quantity: 1,
        itemTotal: 12999,
      },
    ]);

    renderCart();
    await userEvent.click(
      screen.getByRole("button", { name: /continue on amazon/i }),
    );

    expect(openSpy).toHaveBeenCalledWith(
      "https://www.amazon.in/s?k=sneakers",
      "_blank",
      "noopener,noreferrer",
    );

    openSpy.mockRestore();
  });
});
