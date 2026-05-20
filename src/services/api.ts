const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const ACCESS_TOKEN_STORAGE_KEY = "sneaky_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "sneaky_refresh_token";

type RequestOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
  body?: unknown;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  userId?: string;
  name?: string;
  email?: string;
  role?: string;
};

export type RefreshResponse = {
  accessToken: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = LoginPayload & {
  name: string;
  isGuest?: boolean;
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
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as RefreshResponse;
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, payload.accessToken);
  return payload.accessToken;
};

export const apiRequest = async <T>(
  path: string,
  { auth = false, body, headers, ...options }: RequestOptions = {},
): Promise<T> => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

  const request = (token: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...options,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });

  let response = await request(accessToken);

  if (response.status === 401 && auth) {
    const nextAccessToken = await refreshAccessToken();
    if (nextAccessToken) {
      response = await request(nextAccessToken);
    }
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
