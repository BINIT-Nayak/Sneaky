import { createContext } from "react";

export type NotificationItem = {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export type NotificationsContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (message: string) => void;
  clearNotifications: () => void;
  markAllAsRead: () => void;
};

export const NotificationsContext = createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => undefined,
  clearNotifications: () => undefined,
  markAllAsRead: () => undefined,
});
