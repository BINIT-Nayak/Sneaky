import { useDispatch } from "react-redux";

import { render, screen, waitFor } from "@testing-library/react";
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
          ? { userId: "user-1", email: "mina@example.com", name: "Mina", role: "user" }
          : null,
      }}
    >
      <Home />
    </AuthContext.Provider>,
  );

describe("Home", () => {
  beforeEach(() => {
    mockedUseDispatch.mockReturnValue(jest.fn(() => ({
      unwrap: jest.fn().mockResolvedValue(undefined),
    })) as never);
    mockedSelectors.getProducts.mockReturnValue([product]);
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
          user: { userId: "user-1", email: "mina@example.com", name: "Mina", role: "user" },
        }}
      >
        <Home />
      </AuthContext.Provider>,
    );

    expect(screen.getByText("Could not load products")).toBeInTheDocument();
  });
});
