import { useContext } from "react";

import { AuthContext } from "../../context/AuthContext";
import { getWishlist } from "../../utils/storage";
import bellIcon from "../../assets/bell.png";
import emptyList from "../../assets/emptyList.png";

import styles from "./Wishlist.module.css";

export const Wishlist = () => {
  const { isLoggedIn, onOpenAuth } = useContext(AuthContext);
  const wishlistItems = getWishlist(); // Get actual wishlist from storage

  // Not logged in - show login prompt
  if (!isLoggedIn) {
    return (
      <div className={styles.wishlistContainer}>
        <div className={styles.wishlist__prompt}>
          <img
            className={styles.wishlist__icon}
            src={emptyList}
            alt="Empty list icon"
          />
          <div className={styles.wishlist__message}>
            Your wishlist is waiting. Log in to continue.
          </div>
          <button className={styles.wishlist__loginBtn} onClick={onOpenAuth}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Logged in but empty wishlist
  if (wishlistItems.length === 0) {
    return (
      <div className={styles.wishlistContainer}>
        <div className={styles.wishlist__empty}>
          <img
            className={styles.wishlist__icon}
            src={bellIcon}
            alt="Bell icon"
          />
          <div className={styles.wishlist__message}>
            Your wishlist is empty—for now. Start liking products to save them
            here
          </div>
        </div>
      </div>
    );
  }

  // Show wishlist items
  return (
    <div className={styles.wishlistContainer}>
      <div className={styles.wishlist}>
        <h2 className={styles.wishlist__title}>My Wishlist</h2>
        <div className={styles.wishlist__grid}>
          {wishlistItems.map((item) => (
            <div key={item.id} className={styles.wishlist__item}>
              <img
                src={item.image}
                alt={item.name}
                className={styles.wishlist__itemImage}
              />
              <div className={styles.wishlist__itemInfo}>
                <h3>{item.name}</h3>
                <p>{item.brand}</p>
                <p className={styles.wishlist__itemPrice}>
                  ₹{item.price.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
