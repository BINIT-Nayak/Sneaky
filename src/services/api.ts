import {
  getAccessToken,
  notifyUnauthorizedSession,
  setAccessToken,
} from "./authSession";
import type { RefreshResponse } from "./authTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

type RequestOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
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

const refreshAccessToken = async () => {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as RefreshResponse;
  setAccessToken(payload.accessToken);
  return payload.accessToken;
};

const isAuthFailure = (status: number) => status === 401 || status === 403;

export const apiRequest = async <T>(
  path: string,
  { auth = false, body, headers, ...options }: RequestOptions = {},
): Promise<T> => {
  let accessToken = getAccessToken();

  const request = (token: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...options,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });

  if (auth && !accessToken) {
    accessToken = await refreshAccessToken();
  }

  let response = await request(accessToken);

  if (isAuthFailure(response.status) && auth) {
    const nextAccessToken = await refreshAccessToken();
    if (nextAccessToken) {
      response = await request(nextAccessToken);
    }
  }

  if (isAuthFailure(response.status) && auth) {
    notifyUnauthorizedSession();
    throw new Error("Your session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
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
