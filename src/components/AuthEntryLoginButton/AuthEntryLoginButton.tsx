import type { FC } from "react";

import { FaSignInAlt } from "../Icon/Icon";

import style from "./AuthEntryLoginButton.module.css";

interface AuthEntryLoginButtonProps {
  onOpenAuth: () => void;
}

export const AuthEntryLoginButton: FC<AuthEntryLoginButtonProps> = ({
  onOpenAuth,
}) => {
  return (
    <button
      className={style.authLoginButton}
      onClick={onOpenAuth}
      aria-label="Sign in"
    >
      <FaSignInAlt size={20} color="var(--base-color5)" />
    </button>
  );
};
