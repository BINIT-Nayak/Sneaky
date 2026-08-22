import type { UserType } from "../context/AuthContext";
import type { IWishlistItem } from "../store/types";

import { apiRequest } from "./api";

export type UpdateCurrentUserPayload = {
  name?: string;
  email?: string;
  password?: string;
};

export type ProfileSummary = {
  wishlistCount: number;
  cartCount: number;
  recentWishlist: IWishlistItem[];
};

export const userApi = {
  getMe: () =>
    apiRequest<UserType>("/api/users/me", {
      auth: true,
    }),

  getProfileSummary: () =>
    apiRequest<ProfileSummary>("/api/users/me/profile-summary", {
      auth: true,
    }),

  updateMe: (payload: UpdateCurrentUserPayload) =>
    apiRequest<UserType>("/api/users/me", {
      auth: true,
      method: "PATCH",
      body: payload,
    }),
};
