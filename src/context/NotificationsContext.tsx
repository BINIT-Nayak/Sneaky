import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
const SERVER_REFRESH_INTERVAL_MS = 5 * 60_000;
const SERVER_REFRESH_THROTTLE_MS = 60_000;
const INITIAL_SERVER_REFRESH_DELAY_MS = 3500;

type IdleCallbackHandle = number;

type WindowWithIdleCallback = Window & {
  cancelIdleCallback?: (handle: IdleCallbackHandle) => void;
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => IdleCallbackHandle;
};

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
  const { isAuthReady, isLoggedIn } = useContext(AuthContext);
  const [localNotifications, setLocalNotifications] = useState<NotificationItem[]>(
    readNotifications,
  );
  const [serverNotifications, setServerNotifications] = useState<
    NotificationItem[]
  >([]);
  const isRefreshingServerRef = useRef(false);
  const lastServerRefreshAtRef = useRef(0);

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

  const refreshServerNotifications = useCallback(async (force = false) => {
    if (!isAuthReady || !isLoggedIn) {
      return;
    }

    if (isRefreshingServerRef.current) {
      return;
    }

    if (
      !force &&
      Date.now() - lastServerRefreshAtRef.current < SERVER_REFRESH_THROTTLE_MS
    ) {
      return;
    }

    if (document.visibilityState === "hidden" || !navigator.onLine) {
      return;
    }

    isRefreshingServerRef.current = true;

    try {
      const notifications = await notificationsApi.getNotifications();
      lastServerRefreshAtRef.current = Date.now();
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
    } finally {
      isRefreshingServerRef.current = false;
    }
  }, [isAuthReady, isLoggedIn]);

  useEffect(() => {
    if (!isAuthReady) {
      return undefined;
    }

    if (!isLoggedIn) {
      setServerNotifications([]);
      lastServerRefreshAtRef.current = 0;
      return undefined;
    }

    const idleWindow = window as WindowWithIdleCallback;
    const scheduledWithIdleCallback = Boolean(idleWindow.requestIdleCallback);
    const initialRefreshId = scheduledWithIdleCallback
      ? idleWindow.requestIdleCallback(
          () => void refreshServerNotifications(true),
          { timeout: INITIAL_SERVER_REFRESH_DELAY_MS },
        )
      : window.setTimeout(
          () => void refreshServerNotifications(true),
          INITIAL_SERVER_REFRESH_DELAY_MS,
        );

    const intervalId = window.setInterval(
      () => void refreshServerNotifications(),
      SERVER_REFRESH_INTERVAL_MS,
    );
    const handleFocus = () => void refreshServerNotifications();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshServerNotifications();
      }
    };
    const handleOnline = () => void refreshServerNotifications(true);

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);

    return () => {
      if (scheduledWithIdleCallback && idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(initialRefreshId);
      } else {
        window.clearTimeout(initialRefreshId);
      }
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
    };
  }, [isAuthReady, isLoggedIn, refreshServerNotifications]);

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
