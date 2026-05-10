import { MemoryRouter, useNavigate } from "react-router-dom";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthContext } from "../../context/AuthContext";

import { NavBar } from "./NavBar";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

const mockedUseNavigate = jest.mocked(useNavigate);

const renderNavBar = (isLoggedIn = true) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{
          isLoggedIn,
          onOpenAuth: jest.fn(),
          onLogout: jest.fn(),
          onUserUpdate: jest.fn(),
          user: isLoggedIn
            ? { userId: "user-1", email: "mina@example.com", name: "Mina" }
            : null,
        }}
      >
        <NavBar />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

describe("NavBar", () => {
  beforeEach(() => {
    mockedUseNavigate.mockReturnValue(jest.fn());
  });

  it("links home to the app home route for logged-in users", () => {
    renderNavBar();

    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/home",
    );
    expect(screen.getByRole("link", { name: /wish list/i })).toHaveAttribute(
      "href",
      "/wishlist",
    );
    expect(screen.getByRole("link", { name: /cart/i })).toHaveAttribute(
      "href",
      "/cart",
    );
    expect(screen.getByRole("link", { name: /profile/i })).toHaveAttribute(
      "href",
      "/profile",
    );
  });

  it("links home to the landing page for guests", () => {
    renderNavBar(false);

    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("navigates to landing page when the logo is clicked", async () => {
    const navigate = jest.fn();
    mockedUseNavigate.mockReturnValue(navigate);

    renderNavBar();
    await userEvent.click(
      screen.getByRole("button", { name: /go to homepage/i }),
    );

    expect(navigate).toHaveBeenCalledWith("/");
  });
});
