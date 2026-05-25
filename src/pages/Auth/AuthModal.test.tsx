import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthModal } from "./AuthModal";

const setup = (error: string | null = null) => {
  const onClose = jest.fn();
  const onLogin = jest.fn().mockResolvedValue(undefined);
  const onSignUp = jest.fn().mockResolvedValue(undefined);

  render(
    <AuthModal
      isOpen
      onClose={onClose}
      onLogin={onLogin}
      onSignUp={onSignUp}
      error={error}
      isSubmitting={false}
    />,
  );

  return { onClose, onLogin, onSignUp, user: userEvent.setup() };
};

describe("AuthModal", () => {
  it("toggles password visibility", async () => {
    const { user } = setup();
    const passwordInput = screen.getByLabelText("Password");

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));

    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));

    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("rejects weak passwords during sign up before calling the API handler", async () => {
    const { onSignUp, user } = setup();

    await user.click(screen.getByRole("button", { name: "Sign Up" }));
    await user.type(screen.getByLabelText("Name"), "Mina");
    await user.type(screen.getByLabelText("Email"), "mina@example.com");
    await user.type(screen.getByLabelText("Password"), "password1");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(onSignUp).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Password must be at least 8 characters",
    );
  });

  it("submits signup when password satisfies strength rules", async () => {
    const { onSignUp, user } = setup();

    await user.click(screen.getByRole("button", { name: "Sign Up" }));
    await user.type(screen.getByLabelText("Name"), "Mina");
    await user.type(screen.getByLabelText("Email"), "mina@example.com");
    await user.type(screen.getByLabelText("Password"), "Secret@123");
    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(onSignUp).toHaveBeenCalledWith(
      "Mina",
      "mina@example.com",
      "Secret@123",
    );
  });

  it("shows backend unavailable auth errors as a toast", async () => {
    setup(
      "We can't reach Sneaky right now. Please check your connection and try again.",
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We can't reach Sneaky right now",
    );
  });
});
