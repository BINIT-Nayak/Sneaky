import { apiRequest, refreshAccessToken } from "./api";
import type { AuthResponse, LoginPayload, SignUpPayload } from "./authTypes";

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
  refresh: async () => {
    const accessToken = await refreshAccessToken();
    if (!accessToken) {
      throw new Error("Unable to refresh session");
    }
    return { accessToken };
  },
  logout: () =>
    apiRequest<{ message: string }>("/api/auth/logout", {
      method: "POST",
    }),
};
