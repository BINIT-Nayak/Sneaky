import type { ButtonHTMLAttributes, ReactElement } from "react";

import { useClasses } from "../../hooks/useClasses";
import { ButtonVariant } from "./type";

import styles from "./Button.module.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant;
  glow?: boolean;
}

export const Button = ({
  children,
  variant = ButtonVariant.DEFAULT,
  glow = false,
  className,
  disabled,
  ...props
}: ButtonProps): ReactElement => {
  const mods = useClasses(
    styles,
    "button",
    {
      neumorphic: variant == ButtonVariant.NEUMORPHIC,
      glow: glow && !disabled,
      disabled: disabled,
    },
    className,
  );

  return (
    <button className={mods} disabled={disabled} {...props}>
      <span className={styles.button__content}>{children}</span>
      <span className={styles.button__ripple} />
    </button>
  );
};
