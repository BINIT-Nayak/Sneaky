// src/components/Button/Button.tsx
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

import { useClasses } from "../../hooks/useClasses";
import { ButtonVariant } from "./type";

import styles from "./Button.module.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant;
  glow?: boolean;
  children?: ReactNode;
}

export const Button = ({
  variant = ButtonVariant.DEFAULT,
  glow = false,
  className,
  disabled,
  children, 
  ...props
}: ButtonProps): ReactElement => {
  const mods = useClasses(
    styles,
    "button",
    {
      neumorphic: variant === ButtonVariant.NEUMORPHIC,
      glow: glow && !disabled,
      disabled: disabled,
    },
    className,
  );

  return (
     <button className={mods} disabled={disabled} {...props}>
      <span className={styles.button__content} />
      {children && (
        <span className={styles.button__children}>
          {children}
        </span>
      )}
      <span className={styles.button__ripple} />
    </button>
  );
};