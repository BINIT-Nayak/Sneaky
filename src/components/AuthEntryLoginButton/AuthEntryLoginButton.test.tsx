import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthEntryLoginButton } from "./AuthEntryLoginButton";

describe("AuthEntryLoginButton", () => {
  it("opens auth when clicked", async () => {
    const onOpenAuth = jest.fn();

    render(<AuthEntryLoginButton onOpenAuth={onOpenAuth} />);

    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(onOpenAuth).toHaveBeenCalledTimes(1);
  });
});
