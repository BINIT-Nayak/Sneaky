import type { AuthResponse, LoginPayload, SignUpPayload } from "./api";
import { apiRequest } from "./api";

export const authApi = {
  login: (payload: LoginPayload) =>
    apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: payload,
    }),
  signUp: (payload: SignUpPayload) =>
    apiRequest<AuthResponse>("/api/auth/register", {
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
