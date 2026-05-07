import {
  getAuthErrorMessage,
  getUserFriendlyErrorMessage,
} from "./errorMessages";

describe("errorMessages", () => {
  it("maps network and auth errors to user-friendly copy", () => {
    expect(getUserFriendlyErrorMessage(new Error("Failed to fetch"), "Nope")).toBe(
      "We can't reach the server right now. Please check your connection and try again.",
    );

    expect(getUserFriendlyErrorMessage(new Error("401"), "Nope")).toBe(
      "Please sign in again to continue.",
    );
  });

  it("maps auth-specific errors", () => {
    expect(getAuthErrorMessage(new Error("Bad credentials"))).toBe(
      "The email or password you entered is incorrect.",
    );

    expect(getAuthErrorMessage(new Error("Email already in use"))).toBe(
      "An account with this email already exists. Please log in instead.",
    );
  });

  it("falls back when no useful message exists", () => {
    expect(getUserFriendlyErrorMessage({}, "Try again")).toBe("Try again");
  });
});
