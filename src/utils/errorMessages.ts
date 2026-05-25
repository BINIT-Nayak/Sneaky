const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getRawMessage = (error: unknown): string | null => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  if (isRecord(error) && typeof error.message === "string") {
    return error.message;
  }

  return null;
};

const includesAny = (message: string, patterns: string[]) =>
  patterns.some((pattern) => message.includes(pattern));

export const getUserFriendlyErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const rawMessage = getRawMessage(error)?.trim();
  if (!rawMessage) return fallback;

  const message = rawMessage.toLowerCase();

  switch (true) {
    case includesAny(message, [
      "failed to fetch",
      "networkerror",
      "load failed",
    ]):
      return "We can't reach the server right now. Please check your connection and try again.";

    case includesAny(message, ["401", "unauthorized", "not authenticated"]):
      return "Please sign in again to continue.";

    case includesAny(message, ["403", "forbidden"]):
      return "You don't have permission to do that.";

    case message.includes("product not found"):
      return "This product is no longer available.";

    case message.includes("404"):
      return "We couldn't find what you were looking for.";

    case includesAny(message, ["409", "conflict"]):
      return "This item is already up to date.";

    case includesAny(message, ["429", "too many requests"]):
      return "Too many requests. Please wait a moment and try again.";

    case includesAny(message, ["500", "503"]):
      return "Something went wrong on our side. Please try again in a moment.";

    default:
      return rawMessage;
  }
};

export const getRejectedErrorMessage = (
  payload: unknown,
  errorMessage: string | undefined,
  fallback: string,
): string => getUserFriendlyErrorMessage(payload ?? errorMessage, fallback);

export const getAuthErrorMessage = (
  error: unknown,
  fallback = "We couldn't complete that request. Please try again.",
): string => {
  const rawMessage = getRawMessage(error)?.trim();
  if (!rawMessage) return fallback;

  const message = rawMessage.toLowerCase();

  switch (true) {
    case includesAny(message, ["invalid credentials", "bad credentials"]):
      return "The email or password you entered is incorrect.";

    case includesAny(message, [
      "user already exists",
      "email already in use",
      "409",
      "conflict",
    ]):
      return "An account with this email already exists. Please log in instead.";

    case includesAny(message, [
      "failed to fetch",
      "networkerror",
      "load failed",
    ]):
      return "We can't reach Sneaky right now. Please check your connection and try again.";

    case includesAny(message, ["401", "unauthorized"]):
      return "Your session expired. Please log in again.";

    case includesAny(message, [
      "429",
      "too many requests",
      "too many login attempts",
    ]):
      return "Too many login attempts. Try again after 5 minutes.";

    case includesAny(message, ["500", "503"]):
      return "Sneaky is having trouble signing you in. Please try again in a moment.";

    default:
      return getUserFriendlyErrorMessage(error, fallback);
  }
};
