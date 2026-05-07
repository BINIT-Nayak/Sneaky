import {
  isStrongPassword,
  PASSWORD_REQUIREMENT_MESSAGE,
} from "./passwordValidation";

describe("passwordValidation", () => {
  it("accepts passwords with length, letters, numbers, and special characters", () => {
    expect(isStrongPassword("Secret@123")).toBe(true);
    expect(isStrongPassword("A1!aaaaa")).toBe(true);
  });

  it("rejects passwords missing any required component", () => {
    expect(isStrongPassword("Short1!")).toBe(false);
    expect(isStrongPassword("NoNumbers!")).toBe(false);
    expect(isStrongPassword("nospecial123")).toBe(false);
    expect(isStrongPassword("12345678!")).toBe(false);
  });

  it("exports the user-facing requirement message", () => {
    expect(PASSWORD_REQUIREMENT_MESSAGE).toContain("at least 8 characters");
    expect(PASSWORD_REQUIREMENT_MESSAGE).toContain("special character");
  });
});
