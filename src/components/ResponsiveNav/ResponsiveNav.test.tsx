import { MemoryRouter } from "react-router-dom";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthContext } from "../../context/AuthContext";
import { useIsMobile } from "../../hooks/useGetDeviceType";

import { ResponsiveNav } from "./ResponsiveNav";

jest.mock("../../hooks/useGetDeviceType", () => ({
  useIsMobile: jest.fn(),
}));

const mockedUseIsMobile = jest.mocked(useIsMobile);

const renderResponsiveNav = () =>
  render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{
          isAuthReady: true,
          isLoggedIn: true,
          onOpenAuth: jest.fn(),
          onLogout: jest.fn(),
          onUserUpdate: jest.fn(),
          user: { userId: "user-1", email: "mina@example.com", name: "Mina" },
        }}
      >
        <ResponsiveNav />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

describe("ResponsiveNav", () => {
  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("renders the full navbar on desktop", () => {
    mockedUseIsMobile.mockReturnValue(false);

    renderResponsiveNav();

    expect(screen.getByRole("button", { name: /go to homepage/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /open navigation/i }),
    ).not.toBeInTheDocument();
  });

  it("opens and closes the mobile navigation drawer", async () => {
    mockedUseIsMobile.mockReturnValue(true);

    const { container } = renderResponsiveNav();
    await userEvent.click(
      screen.getByRole("button", { name: /open navigation/i }),
    );

    expect(screen.getByRole("dialog", { name: /navigation menu/i })).toBeInTheDocument();
    expect(document.body).toHaveStyle({ overflow: "hidden" });

    const backdrop = container.querySelector("div[aria-hidden='true']");
    expect(backdrop).toBeInTheDocument();

    if (backdrop) {
      await userEvent.click(backdrop);
    }

    await waitFor(() => {
      expect(document.body).not.toHaveStyle({ overflow: "hidden" });
    });
  });
});
