import type { HTMLAttributes, ReactNode } from "react";

import styles from "./Toast.module.css";

interface ToastProps {
  message?: ReactNode | null;
  role?: HTMLAttributes<HTMLDivElement>["role"];
}

export const Toast = ({ message, role = "status" }: ToastProps) => {
  if (!message) return null;

  return (
    <div className={styles.toast} role={role}>
      {message}
    </div>
  );
};
