import { MemoryRouter, useNavigate } from "react-router-dom";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthContext } from "../../context/AuthContext";

import { LandingPage } from "./LandingPage";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../../components/FloatingParticles/FloatingParticles", () => ({
  FloatingParticles: () => <div data-testid="floating-particles" />,
}));

const mockedUseNavigate = jest.mocked(useNavigate);

const renderLandingPage = (isLoggedIn = false, onOpenAuth = jest.fn()) =>
  render(
    <MemoryRouter>
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
        <LandingPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

describe("LandingPage", () => {
  it("renders brand content and public sign-in CTA", async () => {
    const onOpenAuth = jest.fn();
    const navigate = jest.fn();
    mockedUseNavigate.mockReturnValue(navigate);

    renderLandingPage(false, onOpenAuth);

    expect(screen.getByRole("heading", { name: "Sneaky" })).toBeInTheDocument();
    expect(screen.getByText("Swipe to Like")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));
    expect(onOpenAuth).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: "Start Swiping" }));
    expect(navigate).toHaveBeenCalledWith("/home");
  });

  it("hides sign-in CTA for logged-in users", () => {
    mockedUseNavigate.mockReturnValue(jest.fn());

    renderLandingPage(true);

    expect(screen.queryByRole("button", { name: "Sign In" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Swiping" })).toBeInTheDocument();
  });
});
