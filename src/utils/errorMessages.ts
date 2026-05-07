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

export const getUserFriendlyErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const rawMessage = getRawMessage(error)?.trim();
  if (!rawMessage) return fallback;

  const message = rawMessage.toLowerCase();

  if (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("load failed")
  ) {
    return "We can't reach the server right now. Please check your connection and try again.";
  }

  if (
    message.includes("401") ||
    message.includes("unauthorized") ||
    message.includes("not authenticated")
  ) {
    return "Please sign in again to continue.";
  }

  if (message.includes("403") || message.includes("forbidden")) {
    return "You don't have permission to do that.";
  }

  if (message.includes("product not found")) {
    return "This product is no longer available.";
  }

  if (message.includes("404")) {
    return "We couldn't find what you were looking for.";
  }

  if (message.includes("409") || message.includes("conflict")) {
    return "This item is already up to date.";
  }

  if (message.includes("500") || message.includes("503")) {
    return "Something went wrong on our side. Please try again in a moment.";
  }

  return rawMessage;
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

  if (
    message.includes("invalid credentials") ||
    message.includes("bad credentials")
  ) {
    return "The email or password you entered is incorrect.";
  }

  if (
    message.includes("user already exists") ||
    message.includes("email already in use") ||
    message.includes("409") ||
    message.includes("conflict")
  ) {
    return "An account with this email already exists. Please log in instead.";
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("load failed")
  ) {
    return "We can't reach Sneaky right now. Please check your connection and try again.";
  }

  if (message.includes("401") || message.includes("unauthorized")) {
    return "Your session expired. Please log in again.";
  }

  if (message.includes("500") || message.includes("503")) {
    return "Sneaky is having trouble signing you in. Please try again in a moment.";
  }

  return getUserFriendlyErrorMessage(error, fallback);
};
