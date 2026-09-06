import { useDispatch } from "react-redux";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthContext } from "../../context/AuthContext";
import { userApi } from "../../services/userAPI";
import { useSneakyStateSlice } from "../../store/sneakyState/sneakySelectors";

import { Profile } from "./Profile";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
}));

jest.mock("../../services/userAPI", () => ({
  userApi: {
    updateMe: jest.fn(),
  },
}));

jest.mock("../../store/fetchAPI/fetchProfileSummary", () => ({
  fetchProfileSummary: jest.fn(() => ({
    type: "sneakyState/fetchProfileSummary/pending",
  })),
}));

jest.mock("../../store/sneakyState/sneakySlice", () => ({
  sneakyStateActions: {
    hydrateProfileSummaryFromCache: jest.fn((payload) => ({
      payload,
      type: "sneakyState/hydrateProfileSummaryFromCache",
    })),
  },
}));

jest.mock("../../store/sneakyState/sneakySelectors", () => ({
  useSneakyStateSlice: {
    getCart: jest.fn(),
    getCartStatus: jest.fn(),
    getWishlist: jest.fn(),
    getWishlistStatus: jest.fn(),
    getWishlistLoading: jest.fn(),
    getWishlistError: jest.fn(),
    getProfileSummary: jest.fn(),
    getProfileSummaryStatus: jest.fn(),
    getProfileSummaryLoading: jest.fn(),
    getProfileSummaryError: jest.fn(),
  },
}));

const mockedUseDispatch = jest.mocked(useDispatch);
const mockedSelectors = jest.mocked(useSneakyStateSlice);
const mockedUserApi = jest.mocked(userApi);

const renderProfile = (onUserUpdate = jest.fn()) =>
  render(
    <AuthContext.Provider
      value={{
        isAuthReady: true,
        isLoggedIn: true,
        onOpenAuth: jest.fn(),
        onLogout: jest.fn(),
        onUserUpdate,
        user: { userId: "user-1", email: "mina@example.com", name: "Mina" },
      }}
    >
      <Profile />
    </AuthContext.Provider>,
  );

describe("Profile", () => {
  beforeEach(() => {
    mockedUseDispatch.mockReturnValue(jest.fn() as never);
    mockedSelectors.getCart.mockReturnValue([
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
    ]);
    mockedSelectors.getCartStatus.mockReturnValue("succeeded");
    mockedSelectors.getWishlist.mockReturnValue([
      {
        productId: "product-1",
        name: "Air Max",
        price: 12999,
        imageUrl: "image.jpg",
        brandName: "Nike",
      },
    ]);
    mockedSelectors.getWishlistStatus.mockReturnValue("succeeded");
    mockedSelectors.getWishlistLoading.mockReturnValue(false);
    mockedSelectors.getWishlistError.mockReturnValue(null);
    mockedSelectors.getProfileSummary.mockReturnValue({
      wishlistCount: 1,
      cartCount: 2,
      recentWishlist: [
        {
          productId: "product-1",
          name: "Air Max",
          price: 12999,
          imageUrl: "image.jpg",
          brandName: "Nike",
        },
      ],
    });
    mockedSelectors.getProfileSummaryStatus.mockReturnValue("succeeded");
    mockedSelectors.getProfileSummaryLoading.mockReturnValue(false);
    mockedSelectors.getProfileSummaryError.mockReturnValue(null);
    mockedUserApi.updateMe.mockReset();
  });

  it("renders backend-backed wishlist and cart counts", () => {
    renderProfile();

    expect(screen.getByText("Mina")).toBeInTheDocument();
    expect(screen.getByText("Wishlist Items")).toBeInTheDocument();
    expect(screen.getByText("Cart Items")).toBeInTheDocument();
    expect(screen.getByText("Air Max")).toBeInTheDocument();
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("updates profile with password when validation passes", async () => {
    const onUserUpdate = jest.fn();
    mockedUserApi.updateMe.mockResolvedValue({
      userId: "user-1",
      name: "Mina Updated",
      email: "mina.updated@example.com",
    });

    renderProfile(onUserUpdate);
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.clear(screen.getByLabelText("Name"));
    await userEvent.type(screen.getByLabelText("Name"), "Mina Updated");
    await userEvent.clear(screen.getByLabelText("Email"));
    await userEvent.type(
      screen.getByLabelText("Email"),
      "mina.updated@example.com",
    );
    await userEvent.type(screen.getByLabelText("New password"), "Secret@123");
    await userEvent.type(
      screen.getByLabelText("Confirm password"),
      "Secret@123",
    );
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() =>
      expect(mockedUserApi.updateMe).toHaveBeenCalledWith({
        name: "Mina Updated",
        email: "mina.updated@example.com",
        password: "Secret@123",
      }),
    );
    expect(onUserUpdate).toHaveBeenCalledWith({
      userId: "user-1",
      name: "Mina Updated",
      email: "mina.updated@example.com",
    });
  });

  it("rejects weak profile passwords before calling the API", async () => {
    renderProfile();

    await userEvent.click(screen.getByRole("button", { name: /edit/i }));
    await userEvent.type(screen.getByLabelText("New password"), "password1");
    await userEvent.type(screen.getByLabelText("Confirm password"), "password1");
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(mockedUserApi.updateMe).not.toHaveBeenCalled();
    expect(
      screen.getByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument();
  });
});
