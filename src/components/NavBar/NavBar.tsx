// src/components/NavBar/NavBar.tsx
import { NavLink } from "react-router-dom";
import { TiHome } from "react-icons/ti";
import { RiShoppingCartFill } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { GiRoundStar } from "react-icons/gi";
import styles from "./NavBar.module.css";

export const NavBar = () => {
  const cls = (isActive: boolean) =>
    isActive
      ? `${styles.navBar__item} ${styles["navBar__item--active"]}`
      : styles.navBar__item;

  return (
    <div className={styles.navBar}>
      {/* Logo */}
      <div className={styles.navBar__logo}>
        <img
          src="../src/assets/favIcon.png"
          alt="Sneaky"
          className={styles.navBar__logoImage}
          width="44"
          height="44"
        />
        <span className={styles.navBar__logoText}>Sneaky</span>
      </div>

      {/* Links */}
      <nav className={styles.navBar__nav}>
        <NavLink to="/Home" end className={({ isActive }) => cls(isActive)}>
          <span className={styles.navBar__itemIcon}><TiHome /></span>
          <span className={styles.navBar__itemLabel}>Home</span>
        </NavLink>

        <NavLink to="/wishlist" className={({ isActive }) => cls(isActive)}>
          <span className={styles.navBar__itemIcon}><GiRoundStar /></span>
          <span className={styles.navBar__itemLabel}>Wish List</span>
        </NavLink>

        <NavLink to="/cart" className={({ isActive }) => cls(isActive)}>
          <span className={styles.navBar__itemIcon}><RiShoppingCartFill /></span>
          <span className={styles.navBar__itemLabel}>Cart</span>
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => cls(isActive)}>
          <span className={styles.navBar__itemIcon}><CgProfile /></span>
          <span className={styles.navBar__itemLabel}>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};