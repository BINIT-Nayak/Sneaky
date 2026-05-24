import type { UserType } from "../context/AuthContext";

import { apiRequest } from "./api";

export type AdminStats = {
  totalUsers: number;
  admins: number;
  bannedUsers: number;
  totalProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  totalBrands: number;
  totalSwipes: number;
  todaySwipes: number;
};

export type AdminPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type AdminUser = UserType & {
  createdAt?: string;
  isBanned?: boolean;
  isGuest?: boolean;
  lastLogin?: string;
  updatedAt?: string;
};

export type AdminProduct = {
  productId: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category?: string;
  imageUrl?: string;
  isActive?: boolean;
  status?: string;
  rejectionReason?: string;
  brand?: {
    brandId?: string;
    id?: string;
    name?: string;
  };
};

export type AdminBrand = {
  id: string;
  name: string;
};

export type ProductFormPayload = {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  brandId?: string;
  isActive?: boolean;
};

export const adminApi = {
  getStats: () =>
    apiRequest<AdminStats>("/api/admin/dashboard/stats", { auth: true }),

  getUsers: () =>
    apiRequest<AdminPage<AdminUser>>("/api/admin/users?size=50", {
      auth: true,
    }),

  setUserBan: (userId: string, banned: boolean) =>
    apiRequest<{ userId: string; isBanned: boolean }>(
      `/api/admin/users/${userId}/ban`,
      {
        auth: true,
        method: "PUT",
        body: { banned },
      },
    ),

  setUserRole: (userId: string, role: string) =>
    apiRequest<{ userId: string; role: string }>(
      `/api/admin/users/${userId}/role`,
      {
        auth: true,
        method: "PUT",
        body: { role },
      },
    ),

  getProducts: (status = "") =>
    apiRequest<AdminPage<AdminProduct>>(
      `/api/admin/products?size=50${status ? `&status=${status}` : ""}`,
      { auth: true },
    ),

  createProduct: (payload: ProductFormPayload) =>
    apiRequest<unknown>("/api/admin/products", {
      auth: true,
      method: "POST",
      body: payload,
    }),

  updateProduct: (productId: string, payload: ProductFormPayload) =>
    apiRequest<unknown>(`/api/admin/products/${productId}`, {
      auth: true,
      method: "PATCH",
      body: payload,
    }),

  approveProduct: (productId: string) =>
    apiRequest<{ message: string }>(`/api/admin/products/${productId}/approve`, {
      auth: true,
      method: "PUT",
    }),

  rejectProduct: (productId: string, reason: string) =>
    apiRequest<{ message: string; reason: string }>(
      `/api/admin/products/${productId}/reject`,
      {
        auth: true,
        method: "PUT",
        body: { reason },
      },
    ),

  deleteProduct: (productId: string) =>
    apiRequest<void>(`/api/admin/products/${productId}`, {
      auth: true,
      method: "DELETE",
    }),

  getBrands: () => apiRequest<AdminBrand[]>("/api/brands"),

  createBrand: (name: string) =>
    apiRequest<AdminBrand>("/api/admin/brands", {
      auth: true,
      method: "POST",
      body: { name },
    }),

  updateBrand: (brandId: string, name: string) =>
    apiRequest<AdminBrand>(`/api/admin/brands/${brandId}`, {
      auth: true,
      method: "PUT",
      body: { name },
    }),

  deleteBrand: (brandId: string) =>
    apiRequest<void>(`/api/admin/brands/${brandId}`, {
      auth: true,
      method: "DELETE",
    }),
};
