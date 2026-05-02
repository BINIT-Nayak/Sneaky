import { memo, useCallback, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { CgProfile } from "react-icons/cg";
import { GiRoundStar } from "react-icons/gi";
import { RiShoppingCartFill } from "react-icons/ri";
import { TiHome } from "react-icons/ti";

import { AuthContext } from "../../context/AuthContext";
import { getClasses } from "../../hooks/useClasses";

import styles from "./NavBar.module.css";

export const NavBar = memo(() => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);

  const cls = useCallback(
    (isActive: boolean) =>
      getClasses(styles, "navBar__item", { active: isActive }),
    [],
  );

  const homePath = isLoggedIn ? "/home" : "/";

  return (
    <div className={styles.navBar}>
      {/* Logo - Clickable to navigate home */}
      <button
        type="button"
        className={styles.navBar__logo}
        onClick={() => navigate("/")}
        aria-label="Go to homepage"
      >
        <span className={styles.navBar__logoText}>Sneaky</span>
      </button>

      {/* Navigation Links */}
      <nav className={styles.navBar__nav}>
        <NavLink to={homePath} end className={({ isActive }) => cls(isActive)}>
          <span className={styles.navBar__itemIcon}>
            <TiHome />
          </span>
          <span className={styles.navBar__itemLabel}>Home</span>
        </NavLink>

        <NavLink to="/wishlist" className={({ isActive }) => cls(isActive)}>
          <span className={styles.navBar__itemIcon}>
            <GiRoundStar />
          </span>
          <span className={styles.navBar__itemLabel}>Wish List</span>
        </NavLink>

        <NavLink to="/cart" className={({ isActive }) => cls(isActive)}>
          <span className={styles.navBar__itemIcon}>
            <RiShoppingCartFill />
          </span>
          <span className={styles.navBar__itemLabel}>Cart</span>
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => cls(isActive)}>
          <span className={styles.navBar__itemIcon}>
            <CgProfile />
          </span>
          <span className={styles.navBar__itemLabel}>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
});
