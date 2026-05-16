import { useDispatch } from "react-redux";

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthContext } from "../../context/AuthContext";
import { useSneakyStateSlice } from "../../store/sneakyState/sneakySelectors";

import { Home } from "./Home";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
}));

jest.mock("../../components/FloatingParticles/FloatingParticles", () => ({
  FloatingParticles: () => <div data-testid="floating-particles" />,
}));

jest.mock("../../components/SwipeButton/SwipeButton", () => ({
  SwipeButton: ({ type }: { type: string }) => <span>{type}</span>,
}));

jest.mock("../../hooks/useGetDeviceType", () => ({
  useIsMobile: () => false,
  useIsTablet: () => false,
}));

jest.mock("../../store/sneakyState/sneakySelectors", () => ({
  useSneakyStateSlice: {
    getProducts: jest.fn(),
    getProductsLoading: jest.fn(),
    getProductsError: jest.fn(),
  },
}));

const mockedUseDispatch = jest.mocked(useDispatch);
const mockedSelectors = jest.mocked(useSneakyStateSlice);

const product = {
  id: "product-1",
  name: "Air Max",
  price: 12999,
  image: "image.jpg",
  description: "Comfortable sneakers",
  brand: "Nike",
  category: "Sneakers",
  merchantName: "Nike Partner",
  merchantUrl: "https://partners.sneaky.test/nike",
  sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
  colors: [
    { name: "Black", value: "#17151d" },
    { name: "Ivory", value: "#eee4cf" },
    { name: "Clay", value: "#c27a58" },
  ],
  stockStatus: "In stock",
};

const secondProduct = {
  id: "product-2",
  name: "Forum Low",
  price: 9999,
  image: "forum.jpg",
  description: "Retro court sneakers",
  brand: "Adidas",
  category: "Sneakers",
};

const thirdProduct = {
  id: "product-3",
  name: "Club C",
  price: 8999,
  image: "club-c.jpg",
  description: "Clean leather sneakers",
  brand: "Reebok",
  category: "Sneakers",
};

const fourthProduct = {
  id: "product-4",
  name: "Gel Lyte",
  price: 10999,
  image: "gel.jpg",
  description: "Cushioned runners",
  brand: "Asics",
  category: "Sneakers",
};

const renderHome = (isLoggedIn = true, onOpenAuth = jest.fn()) =>
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
      <Home />
    </AuthContext.Provider>,
  );

describe("Home", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockedUseDispatch.mockReturnValue(jest.fn(() => ({
      unwrap: jest.fn().mockResolvedValue(undefined),
    })) as never);
    mockedSelectors.getProducts.mockReturnValue([product]);
    mockedSelectors.getProductsLoading.mockReturnValue(false);
    mockedSelectors.getProductsError.mockReturnValue(null);
  });

  it("renders the current product and dispatches fetch on mount", () => {
    const dispatch = jest.fn(() => ({
      unwrap: jest.fn().mockResolvedValue(undefined),
    }));
    mockedUseDispatch.mockReturnValue(dispatch as never);

    renderHome();

    expect(screen.getByText("Air Max")).toBeInTheDocument();
    expect(screen.getByText("Nike")).toBeInTheDocument();
    expect(screen.getByText("Sneakers")).toBeInTheDocument();
    expect(screen.getByText("Comfortable sneakers")).toBeInTheDocument();
    expect(dispatch).toHaveBeenCalled();
  });

  it("opens auth instead of liking when guest clicks wishlist action", async () => {
    const onOpenAuth = jest.fn();

    renderHome(false, onOpenAuth);
    await userEvent.click(
      screen.getByRole("button", { name: "Like / Add to Wishlist" }),
    );

    expect(onOpenAuth).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/please sign in to add to wishlist/i)).toBeInTheDocument();
  });

  it("dispatches add-to-cart action for logged-in users", async () => {
    const dispatch = jest.fn(() => ({
      unwrap: jest.fn().mockResolvedValue(undefined),
    }));
    mockedUseDispatch.mockReturnValue(dispatch as never);

    renderHome();
    await userEvent.click(screen.getByRole("button", { name: "Add to Cart" }));

    await waitFor(() => expect(dispatch).toHaveBeenCalled());
  });

  it("opens product details from the home card", async () => {
    renderHome();

    await userEvent.click(screen.getByRole("button", { name: /see details/i }));

    const dialog = screen.getByRole("dialog");

    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByRole("heading", { name: "Air Max" }),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Sneakers")).toBeInTheDocument();
    expect(within(dialog).getByText("Nike Partner")).toHaveAttribute(
      "href",
      "https://partners.sneaky.test/nike",
    );
    expect(
      within(dialog).getByText(/in stock|selling fast|only a few left/i),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "UK 8" }),
    ).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      within(dialog).getByRole("button", { name: "Black" }),
    ).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("adds to cart directly from the details modal", async () => {
    const dispatch = jest.fn(() => ({
      unwrap: jest.fn().mockResolvedValue(undefined),
    }));
    mockedUseDispatch.mockReturnValue(dispatch as never);

    renderHome();
    await userEvent.click(screen.getByRole("button", { name: /see details/i }));

    const dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "UK 10" }));
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Add to Cart" }),
    );

    await waitFor(() => expect(dispatch).toHaveBeenCalled());
  });

  it("shows recently viewed products from localStorage", async () => {
    window.localStorage.setItem(
      "sneaky:recently-viewed-products",
      JSON.stringify([secondProduct.id, thirdProduct.id, fourthProduct.id]),
    );
    mockedSelectors.getProducts.mockReturnValue([
      product,
      secondProduct,
      thirdProduct,
      fourthProduct,
    ]);

    renderHome();

    expect(
      screen.getByRole("region", { name: "Recently viewed sneakers" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Forum Low" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Club C" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Gel Lyte" }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Forum Low" }));

    expect(screen.getByText("Retro court sneakers")).toBeInTheDocument();
  });

  it("shows product finished and error states", () => {
    mockedSelectors.getProducts.mockReturnValue([]);
    const { rerender } = renderHome();

    expect(screen.getByText(/you've seen all products/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Over" })).toBeInTheDocument();

    mockedSelectors.getProductsError.mockReturnValue("Could not load products");
    rerender(
      <AuthContext.Provider
        value={{
          isLoggedIn: true,
          onOpenAuth: jest.fn(),
          onLogout: jest.fn(),
          onUserUpdate: jest.fn(),
          user: { userId: "user-1", email: "mina@example.com", name: "Mina" },
        }}
      >
        <Home />
      </AuthContext.Provider>,
    );

    expect(screen.getByText("Could not load products")).toBeInTheDocument();
  });
});
