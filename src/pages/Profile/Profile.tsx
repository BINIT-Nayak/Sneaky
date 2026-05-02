import type { FC } from "react";
import { useContext, useMemo } from "react";

import { FiUser, FiHeart, FiShoppingBag, FiLogOut } from "react-icons/fi";

import { AuthContext } from "../../context/AuthContext";
import type { Product } from "../../samples/product";
import { getWishlist, getCartItemCount } from "../../utils/storage";

import styles from "./Profile.module.css";

export const Profile: FC = () => {
  const { isLoggedIn, user, onLogout, onOpenAuth } = useContext(AuthContext);

  const userData = useMemo((): {
    wishlistCount: number;
    cartCount: number;
    recentWishlist: Product[];
  } => {
    if (!isLoggedIn) {
      return {
        wishlistCount: 0,
        cartCount: 0,
        recentWishlist: [],
      };
    }
    const wishlist = getWishlist();
    return {
      wishlistCount: wishlist.length,
      recentWishlist: wishlist.slice(0, 4), // Get last 4 items
      cartCount: getCartItemCount(),
    };
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.profileNotLoggedIn}>
          <FiUser className={styles.profileNotLoggedInIcon} />
          <h2>Not Logged In</h2>
          <p>Please log in to view your profile</p>
          <button className={styles.profile__loginBtn} onClick={onOpenAuth}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profile}>
        {/* Profile Header */}
        <div className={styles.profile__header}>
          <div className={styles.profile__avatar}>
            <FiUser />
          </div>
          <h2 className={styles.profile__name}>{user?.name || "User"}</h2>
          <p className={styles.profile__email}>{user?.email}</p>
          <button className={styles.profile__logoutBtn} onClick={onLogout}>
            <FiLogOut /> Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className={styles.profile__stats}>
          <div className={styles.profile__statCard}>
            <FiHeart className={styles.profile__statIcon} />
            <div className={styles.profile__statValue}>
              {userData.wishlistCount}
            </div>
            <div className={styles.profile__statLabel}>Wishlist Items</div>
          </div>
          <div className={styles.profile__statCard}>
            <FiShoppingBag className={styles.profile__statIcon} />
            <div className={styles.profile__statValue}>
              {userData.cartCount}
            </div>
            <div className={styles.profile__statLabel}>Cart Items</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.profile__section}>
          <h3 className={styles.profile__sectionTitle}>
            Recent Wishlist Items
          </h3>
          {userData.recentWishlist.length > 0 ? (
            <div className={styles.profile__recentGrid}>
              {userData.recentWishlist.map((item) => (
                <div key={item.id} className={styles.profile__recentItem}>
                  <img src={item.image} alt={item.name} />
                  <p>{item.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.profile__emptyMessage}>
              No wishlist items yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
