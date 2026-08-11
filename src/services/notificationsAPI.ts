import { apiRequest } from "./api";

export type ServerNotification = {
  notificationId: string;
  productId: string | null;
  productName: string | null;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  readAt: string | null;
};

export const notificationsApi = {
  getNotifications: () =>
    apiRequest<ServerNotification[]>("/api/notifications", {
      auth: true,
      method: "GET",
    }),

  markAllAsRead: () =>
    apiRequest<void>("/api/notifications/read-all", {
      auth: true,
      method: "PATCH",
    }),

  clearNotifications: () =>
    apiRequest<void>("/api/notifications", {
      auth: true,
      method: "DELETE",
    }),
};
