import { useContext, useEffect } from "react";

import { RiDeleteBin6Line, RiNotification3Line } from "react-icons/ri";

import { NotificationsContext } from "../../context/notifications";

import styles from "./Notifications.module.css";

const getNotificationType = (message: string) => {
  const normalized = message.toLowerCase();
  if (normalized.includes("wishlist")) return "wishlist";
  if (normalized.includes("cart")) return "cart";
  if (normalized.includes("couldn't") || normalized.includes("failed")) {
    return "error";
  }
  return "general";
};

const formatTime = (createdAt: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAt));

export const Notifications = () => {
  const { notifications, clearNotifications, markAllAsRead } =
    useContext(NotificationsContext);

  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  return (
    <section className={styles.notifications}>
      <header className={styles.notifications__header}>
        <div>
          <p className={styles.notifications__eyebrow}>Your activity</p>
          <h1>Notifications</h1>
          <p className={styles.notifications__subtitle}>
            Every toast has a home here, so the useful bits do not disappear.
          </p>
        </div>
        {notifications.length > 0 ? (
          <button
            className={styles.notifications__clear}
            type="button"
            onClick={clearNotifications}
          >
            <RiDeleteBin6Line /> Clear all
          </button>
        ) : null}
      </header>

      {notifications.length === 0 ? (
        <div className={styles.notifications__empty}>
          <span><RiNotification3Line /></span>
          <h2>All quiet for now</h2>
          <p>Wishlist, cart, and other toast updates will appear here.</p>
        </div>
      ) : (
        <div className={styles.notifications__list}>
          {notifications.map((notification) => {
            const type = getNotificationType(notification.message);
            return (
              <article
                className={`${styles.notifications__item} ${styles[`notifications__item_${type}`]}`}
                key={notification.id}
              >
                <span className={styles.notifications__icon} aria-hidden="true">
                  {type === "wishlist" ? "♥" : type === "cart" ? "🛒" : type === "error" ? "!" : "✦"}
                </span>
                <div>
                  <p>{notification.message}</p>
                  <time dateTime={notification.createdAt}>
                    {formatTime(notification.createdAt)}
                  </time>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
