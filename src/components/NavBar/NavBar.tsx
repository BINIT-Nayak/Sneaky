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
        Sneaky
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
          Home
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
          Wish List
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
          Cart
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
          Profile
        </NavLink>
      </div>
    </div>
  );
};
