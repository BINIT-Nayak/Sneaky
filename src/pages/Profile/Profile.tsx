// src/pages/Profile/Profile.tsx
import { useState, useEffect, useContext, type FC } from "react";
import { AuthContext } from "../../App";
import {type Product } from "../../types/product";
import { getWishlist, getCartItemCount } from "../../utils/storage";
import { FiUser, FiMail, FiHeart, FiShoppingBag, FiLogOut } from "react-icons/fi";
import styles from "./Profile.module.css";

export const Profile:FC = () => {
  const { isLoggedIn, user, onLogout, onOpenAuth } = useContext(AuthContext);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [recentWishlist, setRecentWishlist] = useState<Product[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      loadUserData();
    }
  }, [isLoggedIn]);

  const loadUserData = () => {
    const wishlist = getWishlist();
    setWishlistCount(wishlist.length);
    setRecentWishlist(wishlist.slice(0, 4)); // Get last 4 items
    setCartCount(getCartItemCount());
  };

  if (!isLoggedIn) {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.profileNotLoggedIn}>
          <FiUser className={styles.profileNotLoggedInIcon} />
          <h2>Not Logged In</h2>
          <p>Please log in to view your profile</p>
          <button 
          className={styles.profile__loginBtn}
          onClick={onOpenAuth}
        >
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
          <h2 className={styles.profile__name}>{user?.name || 'User'}</h2>
          <p className={styles.profile__email}>{user?.email}</p>
          <button className={styles.profile__logoutBtn} onClick={onLogout}>
            <FiLogOut /> Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className={styles.profile__stats}>
          <div className={styles.profile__statCard}>
            <FiHeart className={styles.profile__statIcon} />
            <div className={styles.profile__statValue}>{wishlistCount}</div>
            <div className={styles.profile__statLabel}>Wishlist Items</div>
          </div>
          <div className={styles.profile__statCard}>
            <FiShoppingBag className={styles.profile__statIcon} />
            <div className={styles.profile__statValue}>{cartCount}</div>
            <div className={styles.profile__statLabel}>Cart Items</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.profile__section}>
          <h3 className={styles.profile__sectionTitle}>Recent Wishlist Items</h3>
          {recentWishlist.length > 0 ? (
            <div className={styles.profile__recentGrid}>
              {recentWishlist.map((item) => (
                <div key={item.id} className={styles.profile__recentItem}>
                  <img src={item.image} alt={item.name} />
                  <p>{item.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.profile__emptyMessage}>No wishlist items yet</p>
          )}
        </div>
      </div>
    </div>
  );
};