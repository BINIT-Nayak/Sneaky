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

    expect(getUserFriendlyErrorMessage(new Error("429"), "Nope")).toBe(
      "Too many requests. Please wait a moment and try again.",
    );
  });

  it("maps auth-specific errors", () => {
    expect(getAuthErrorMessage(new Error("Bad credentials"))).toBe(
      "The email or password you entered is incorrect.",
    );

    expect(getAuthErrorMessage(new Error("Email already in use"))).toBe(
      "An account with this email already exists. Please log in instead.",
    );

    expect(getAuthErrorMessage(new Error("Request failed with status 429"))).toBe(
      "Too many login attempts. Try again after 5 minutes.",
    );
  });

  it("falls back when no useful message exists", () => {
    expect(getUserFriendlyErrorMessage({}, "Try again")).toBe("Try again");
  });
});
