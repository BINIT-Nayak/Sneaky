import { NavLink } from "react-router-dom";

import { TiHome } from "react-icons/ti";
import { RiShoppingCartFill } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { GiRoundStar } from "react-icons/gi";

import styles from "./NavBar.module.css";

export const NavBar = () => {
  return (
    <div className={styles.navBar}>
      <div className={styles.navBar__title}>
        <img
          src="../src/assets/favIcon.png"
          alt="Sneaky Logo"
          width="50"
          height="50"
        />
        <span className={styles.navBar__titleText}>Sneaky</span>
      </div>

      <div className={styles.navBar__container}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? `${styles.navBar__item} ${styles.navBar__item_active}`
              : styles.navBar__item
          }
        >
          <TiHome />
          <span className={styles.navBar__label}>Home</span>
        </NavLink>

        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            isActive
              ? `${styles.navBar__item} ${styles.navBar__item_active}`
              : styles.navBar__item
          }
        >
          <GiRoundStar />
          <span className={styles.navBar__label}>Wish List</span>
        </NavLink>

        <NavLink
          to="/cart"
          className={({ isActive }) =>
            isActive
              ? `${styles.navBar__item} ${styles.navBar__item_active}`
              : styles.navBar__item
          }
        >
          <RiShoppingCartFill />
          <span className={styles.navBar__label}>Cart</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive
              ? `${styles.navBar__item} ${styles.navBar__item_active}`
              : styles.navBar__item
          }
        >
          <CgProfile />
          <span className={styles.navBar__label}>Profile</span>
        </NavLink>
      </div>
    </div>
  );
};
