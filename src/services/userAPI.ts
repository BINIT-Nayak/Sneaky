import type { UserType } from "../context/AuthContext";

import { apiRequest } from "./api";

export const userApi = {
  getMe: () =>
    apiRequest<UserType>("/api/users/me", {
      auth: true,
    }),
};
