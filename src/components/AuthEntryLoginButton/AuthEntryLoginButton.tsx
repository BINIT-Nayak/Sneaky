import { FaSignInAlt } from "react-icons/fa";

import style from "./AuthEntryLoginButton.module.css";

export const AuthEntryLoginButton = () => {
  const onclick = () => {
    console.log("login");
  };

  return (
    <div className={style.authLoginButton} onPointerUp={onclick}>
      <FaSignInAlt size={20} color="var(--base-color2)" />
    </div>
  );
};
