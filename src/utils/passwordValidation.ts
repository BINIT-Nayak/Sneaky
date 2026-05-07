export const PASSWORD_REQUIREMENT_MESSAGE =
  "Password must be at least 8 characters and include letters, numbers, and a special character";

export const isStrongPassword = (password: string) =>
  password.length >= 8 &&
  /[A-Za-z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);
