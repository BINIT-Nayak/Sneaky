import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthModal } from "./AuthModal";

const setup = () => {
  const onClose = jest.fn();
  const onLogin = jest.fn().mockResolvedValue(undefined);
  const onSignUp = jest.fn().mockResolvedValue(undefined);

  render(
    <AuthModal
      isOpen
      onClose={onClose}
      onLogin={onLogin}
      onSignUp={onSignUp}
      error={null}
      isSubmitting={false}
    />,
  );

  return { onClose, onLogin, onSignUp, user: userEvent.setup() };
};

describe("AuthModal", () => {
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
});
