import type { Product } from "../samples/product";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const ACCESS_TOKEN_STORAGE_KEY = "sneaky_access_token";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
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

export const apiRequest = async <T>(
  path: string,
  { body, headers, ...options }: RequestOptions = {},
): Promise<T> => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as T;
};

export const authApi = {
  login: (payload: LoginPayload) =>
    apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: payload,
    }),
  signUp: (payload: SignUpPayload) =>
    apiRequest<AuthResponse>("/api/users", {
      method: "POST",
      body: {
        ...payload,
        isGuest: payload.isGuest ?? false,
      },
    }),
  logout: (refreshToken: string) =>
    apiRequest<{ message: string }>("/api/auth/logout", {
      method: "POST",
      body: { refreshToken },
    }),
};

export const productsApi = {
  getProducts: () => apiRequest<Product[]>("/api/products"),
};
