import {
  getAccessToken,
  notifyUnauthorizedSession,
  setAccessToken,
} from "./authSession";
import type { RefreshResponse } from "./authTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
let refreshAccessTokenPromise: Promise<string | null> | null = null;
const inFlightGetRequests = new Map<string, Promise<unknown>>();

type AuthMode = boolean | "optional";

type RequestOptions = Omit<RequestInit, "body"> & {
  auth?: AuthMode;
  body?: unknown;
};

const getErrorMessage = async (response: Response) => {
  try {
    const payload = await response.json();
    return (
      payload.message ??
      payload.detail ??
      payload.error ??
      `Request failed with status ${response.status}`
    );
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export const isUnauthorizedApiError = (error: unknown) =>
  error instanceof ApiRequestError && isAuthFailure(error.status);

const requestRefreshAccessToken = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiRequestError(await getErrorMessage(response), response.status);
  }

  const payload = (await response.json()) as RefreshResponse;
  setAccessToken(payload.accessToken);
  return payload.accessToken;
};

const isAuthFailure = (status: number) => status === 401 || status === 403;

export const refreshAccessToken = () => {
  refreshAccessTokenPromise ??= requestRefreshAccessToken().finally(() => {
    refreshAccessTokenPromise = null;
  });

  return refreshAccessTokenPromise;
};

export const apiRequest = async <T>(
  path: string,
  { auth = false, body, headers, ...options }: RequestOptions = {},
): Promise<T> => {
  const method = (options.method ?? "GET").toUpperCase();
  const canDedupeRequest = method === "GET" && body === undefined;
  const dedupeKey = canDedupeRequest
    ? `${method}:${auth}:${API_BASE_URL}${path}`
    : null;

  if (dedupeKey) {
    const existingRequest = inFlightGetRequests.get(dedupeKey);
    if (existingRequest) {
      return existingRequest as Promise<T>;
    }
  }

  const requestPromise = executeApiRequest<T>(path, {
    ...options,
    auth,
    body,
    headers,
  });

  if (!dedupeKey) {
    return requestPromise;
  }

  inFlightGetRequests.set(dedupeKey, requestPromise);
  requestPromise.finally(() => {
    inFlightGetRequests.delete(dedupeKey);
  });

  return requestPromise;
};

const executeApiRequest = async <T>(
  path: string,
  { auth = false, body, headers, ...options }: RequestOptions = {},
): Promise<T> => {
  const requiresAuth = auth === true;
  const sendsAuth = requiresAuth || auth === "optional";
  let accessToken = getAccessToken();

  const request = (token: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...options,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(sendsAuth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });

  const refreshForProtectedRequest = async () => {
    try {
      return await refreshAccessToken();
    } catch (error) {
      if (isUnauthorizedApiError(error)) {
        notifyUnauthorizedSession();
        throw new Error("Your session expired. Please log in again.");
      }

      throw error;
    }
  };

  if (requiresAuth && !accessToken) {
    accessToken = await refreshForProtectedRequest();
  }

  let response = await request(accessToken);

  if (isAuthFailure(response.status) && requiresAuth) {
    const nextAccessToken = await refreshForProtectedRequest();
    if (nextAccessToken) {
      response = await request(nextAccessToken);
    }
  }

  if (isAuthFailure(response.status) && auth === "optional" && accessToken) {
    try {
      const nextAccessToken = await refreshAccessToken();
      response = await request(nextAccessToken);
    } catch {
      response = await request(null);
    }
  }

  if (isAuthFailure(response.status) && requiresAuth) {
    notifyUnauthorizedSession();
    throw new Error("Your session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new ApiRequestError(await getErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();
  if (!responseText) {
    return undefined as T;
  }

  return JSON.parse(responseText) as T;
};

export const rawApiRequest = async <T>(
  path: string,
  { body, headers, ...options }: RequestOptions = {},
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as T;
};
