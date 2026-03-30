// src/components/NavBar/NavBar.tsx
import { NavLink, useNavigate } from "react-router-dom";
import { TiHome } from "react-icons/ti";
import { RiShoppingCartFill } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { GiRoundStar } from "react-icons/gi";
import { memo, useCallback } from "react";
import styles from "./NavBar.module.css";

export const NavBar = memo(() => {
  const navigate = useNavigate();

  const cls = useCallback((isActive: boolean) => 
    isActive
      ? `${styles.navBar__item} ${styles["navBar__item--active"]}`
      : styles.navBar__item, 
  []);

  const handleLogoClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div className={styles.navBar}>
      {/* Logo - Clickable to navigate home */}
      <div 
        className={styles.navBar__logo} 
        onClick={handleLogoClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleLogoClick();
          }
        }}
        aria-label="Go to homepage"
      >
        <img
          src="../src/assets/favIcon.png"
          alt="Sneaky"
          className={styles.navBar__logoImage}
          width="48"
          height="48"
          loading="eager"
        />
        <span className={styles.navBar__logoText}>Sneaky</span>
      </div>

      {/* Navigation Links */}
      <nav className={styles.navBar__nav}>
        <NavLink to="/" end className={({ isActive }) => cls(isActive)}>
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

NavBar.displayName = "NavBar";