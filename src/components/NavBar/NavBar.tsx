import { memo, useCallback, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { CgProfile, GiRoundStar, RiAdminFill, RiNotification3Fill, RiShoppingCartFill, TiHome } from "../Icon/Icon";

import { AuthContext } from "../../context/AuthContext";
import { NotificationsContext } from "../../context/notifications";
import { getClasses } from "../../hooks/useClasses";
import { isAdminRole } from "../../utils/roles";

import styles from "./NavBar.module.css";

export const NavBar = memo(() => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationsContext);

  const cls = useCallback(
    (isActive: boolean) =>
      getClasses(styles, "navBar__item", { active: isActive }),
    [],
  );

  const homePath = isLoggedIn ? "/home" : "/";
  const isAdmin = isAdminRole(user?.role);

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
        <NavLink
          to={homePath}
          end
          className={({ isActive }) => cls(isActive)}
          aria-label="Home"
        >
          <span className={styles.navBar__itemIcon}>
            <TiHome />
          </span>
          <span className={styles.navBar__itemLabel}>Home</span>
        </NavLink>

        {isAdmin ? (
          <NavLink
            to="/admin"
            className={({ isActive }) => cls(isActive)}
            aria-label="Admin"
          >
            <span className={styles.navBar__itemIcon}>
              <RiAdminFill />
            </span>
            <span className={styles.navBar__itemLabel}>Admin</span>
          </NavLink>
        ) : (
          <>
            <NavLink
              to="/wishlist"
              className={({ isActive }) => cls(isActive)}
              aria-label="Wish List"
            >
              <span className={styles.navBar__itemIcon}>
                <GiRoundStar />
              </span>
              <span className={styles.navBar__itemLabel}>Wish List</span>
            </NavLink>

            <NavLink
              to="/cart"
              className={({ isActive }) => cls(isActive)}
              aria-label="Cart"
            >
              <span className={styles.navBar__itemIcon}>
                <RiShoppingCartFill />
              </span>
              <span className={styles.navBar__itemLabel}>Cart</span>
            </NavLink>

            <NavLink
              to="/notifications"
              className={({ isActive }) => cls(isActive)}
              aria-label="Notifications"
            >
              <span className={styles.navBar__itemIcon}>
                <RiNotification3Fill />
                {unreadCount > 0 ? (
                  <span className={styles.navBar__badge}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </span>
              <span className={styles.navBar__itemLabel}>Notifications</span>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) => cls(isActive)}
              aria-label="Profile"
            >
              <span className={styles.navBar__itemIcon}>
                <CgProfile />
              </span>
              <span className={styles.navBar__itemLabel}>Profile</span>
            </NavLink>
          </>
        )}
      </nav>
    </div>
  );
});
