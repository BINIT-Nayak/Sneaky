import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { notificationsApi } from "../services/notificationsAPI";

import { AuthContext } from "./AuthContext";
import {
  NotificationsContext,
  type NotificationItem,
} from "./notifications";

const STORAGE_KEY = "sneaky:notifications";
const MAX_NOTIFICATIONS = 100;

const readNotifications = (): NotificationItem[] => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed)
      ? parsed
          .filter(
            (
              item,
            ): item is Omit<NotificationItem, "source"> & {
              source?: "local";
            } =>
            typeof item === "object" &&
            item !== null &&
            typeof item.id === "string" &&
            typeof item.message === "string" &&
            typeof item.createdAt === "string" &&
            typeof item.read === "boolean" &&
            (item.source === undefined || item.source === "local"),
          )
          .map((item) => ({ ...item, source: "local" as const }))
      : [];
  } catch {
    return [];
  }
};

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn } = useContext(AuthContext);
  const [localNotifications, setLocalNotifications] = useState<NotificationItem[]>(
    readNotifications,
  );
  const [serverNotifications, setServerNotifications] = useState<
    NotificationItem[]
  >([]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(localNotifications),
      );
    } catch {
      // Notifications still work for this session if browser storage is blocked.
    }
  }, [localNotifications]);

  const refreshServerNotifications = useCallback(async () => {
    if (!isLoggedIn) {
      return;
    }

    try {
      const notifications = await notificationsApi.getNotifications();
      setServerNotifications(
        notifications.map((notification) => ({
          id: notification.notificationId,
          message: notification.message,
          createdAt: notification.createdAt,
          read: notification.read,
          source: "server",
        })),
      );
    } catch {
      // Existing notifications remain visible if a background refresh fails.
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    const initialRefreshId = window.setTimeout(
      () => void refreshServerNotifications(),
      0,
    );

    const intervalId = window.setInterval(
      () => void refreshServerNotifications(),
      60_000,
    );
    const handleFocus = () => void refreshServerNotifications();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearTimeout(initialRefreshId);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isLoggedIn, refreshServerNotifications]);

  const addNotification = useCallback((message: string) => {
    const normalizedMessage = message.trim();
    if (!normalizedMessage) return;

    setLocalNotifications((current) => [
      {
        id: `${Date.now()}-${crypto.randomUUID?.() ?? Math.random()}`,
        message: normalizedMessage,
        createdAt: new Date().toISOString(),
        read: false,
        source: "local" as const,
      },
      ...current,
    ].slice(0, MAX_NOTIFICATIONS));
  }, []);

  const clearNotifications = useCallback(() => {
    setLocalNotifications([]);
    setServerNotifications([]);
    if (isLoggedIn) {
      void notificationsApi.clearNotifications().catch(() => {
        void refreshServerNotifications();
      });
    }
  }, [isLoggedIn, refreshServerNotifications]);

  const markAllAsRead = useCallback(() => {
    setLocalNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
    setServerNotifications((current) =>
      current.map((notification) => ({ ...notification, read: true })),
    );
    if (isLoggedIn) {
      void notificationsApi.markAllAsRead().catch(() => {
        void refreshServerNotifications();
      });
    }
  }, [isLoggedIn, refreshServerNotifications]);

  const notifications = useMemo(
    () =>
      [...serverNotifications, ...localNotifications].sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      ),
    [localNotifications, serverNotifications],
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
