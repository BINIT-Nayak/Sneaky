import { useContext, useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

import { NotificationsContext } from "../../context/notifications";

import styles from "./Toast.module.css";

interface ToastProps {
  message?: ReactNode | null;
  role?: HTMLAttributes<HTMLDivElement>["role"];
}

export const Toast = ({ message, role = "status" }: ToastProps) => {
  const { addNotification } = useContext(NotificationsContext);
  const recordedMessageRef = useRef<ReactNode | null>(null);

  useEffect(() => {
    if (typeof message !== "string" || recordedMessageRef.current === message) {
      return;
    }

    recordedMessageRef.current = message;
    addNotification(message);
  }, [addNotification, message]);

  if (!message) return null;

  return (
    <div className={styles.toast} role={role}>
      {message}
    </div>
  );
};
