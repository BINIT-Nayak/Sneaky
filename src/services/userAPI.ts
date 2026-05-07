import type { UserType } from "../context/AuthContext";

import { apiRequest } from "./api";

export type UpdateCurrentUserPayload = {
  name?: string;
  email?: string;
  password?: string;
};

export const userApi = {
  getMe: () =>
    apiRequest<UserType>("/api/users/me", {
      auth: true,
    }),

  updateMe: (payload: UpdateCurrentUserPayload) =>
    apiRequest<UserType>("/api/users/me", {
      auth: true,
      method: "PATCH",
      body: payload,
    }),
};
