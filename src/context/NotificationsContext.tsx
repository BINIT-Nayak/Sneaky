import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  NotificationsContext,
  type NotificationItem,
} from "./notifications";

//Notification service is frontend only, so we can store notifications in local storage. This is not ideal, but it works for now. We can always change this later if we need to.
const STORAGE_KEY = "sneaky:notifications";
const MAX_NOTIFICATIONS = 100;

const readNotifications = (): NotificationItem[] => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is NotificationItem =>
            typeof item === "object" &&
            item !== null &&
            typeof item.id === "string" &&
            typeof item.message === "string" &&
            typeof item.createdAt === "string" &&
            typeof item.read === "boolean",
        )
      : [];
  } catch {
    return [];
  }
};

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    readNotifications,
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // Notifications still work for this session if browser storage is blocked.
    }
  }, [notifications]);

  const addNotification = useCallback((message: string) => {
    const normalizedMessage = message.trim();
    if (!normalizedMessage) return;

    setNotifications((current) => [
      {
        id: `${Date.now()}-${crypto.randomUUID?.() ?? Math.random()}`,
        message: normalizedMessage,
        createdAt: new Date().toISOString(),
        read: false,
      },
      ...current,
    ].slice(0, MAX_NOTIFICATIONS));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);
  const markAllAsRead = useCallback(
    () =>
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, read: true })),
      ),
    [],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: notifications.filter(({ read }) => !read).length,
      addNotification,
      clearNotifications,
      markAllAsRead,
    }),
    [addNotification, clearNotifications, markAllAsRead, notifications],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
