import type { FC } from "react";
import type { FormEvent } from "react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import {
  FiUser,
  FiHeart,
  FiShoppingBag,
  FiLogOut,
  FiEdit2,
  FiSave,
  FiX,
} from "react-icons/fi";

import { AuthContext } from "../../context/AuthContext";
import { userApi } from "../../services/userAPI";
import { fetchCart } from "../../store/fetchAPI/fetchCart";
import { fetchWishlist } from "../../store/fetchAPI/fetchWishlist";
import { useSneakyStateSlice } from "../../store/sneakyState/sneakySelectors";
import type { AppDispatch } from "../../store/sneakyStore";
import type { IWishlistItem } from "../../store/types";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import {
  isStrongPassword,
  PASSWORD_REQUIREMENT_MESSAGE,
} from "../../utils/passwordValidation";

import styles from "./Profile.module.css";

export const Profile: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, user, onLogout, onOpenAuth, onUserUpdate } =
    useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [profileEmail, setProfileEmail] = useState(user?.email ?? "");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const cart = useSneakyStateSlice.getCart();
  const cartStatus = useSneakyStateSlice.getCartStatus();
  const wishlist = useSneakyStateSlice.getWishlist();
  const wishlistStatus = useSneakyStateSlice.getWishlistStatus();
  const wishlistLoading = useSneakyStateSlice.getWishlistLoading();
  const wishlistError = useSneakyStateSlice.getWishlistError();

  useEffect(() => {
    if (!isLoggedIn || cartStatus !== "idle") return;

    void dispatch(fetchCart());
  }, [cartStatus, dispatch, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || wishlistStatus !== "idle") return;

    void dispatch(fetchWishlist());
  }, [dispatch, isLoggedIn, wishlistStatus]);

  useEffect(() => {
    setProfileName(user?.name ?? "");
    setProfileEmail(user?.email ?? "");
  }, [user]);

  const userData = useMemo((): {
    wishlistCount: number;
    cartCount: number;
    recentWishlist: IWishlistItem[];
  } => {
    if (!isLoggedIn) {
      return {
        wishlistCount: 0,
        cartCount: 0,
        recentWishlist: [],
      };
    }

    return {
      wishlistCount: wishlist.length,
      recentWishlist: wishlist.slice(0, 10), // Get last 10 items
      cartCount: cart.reduce((count, item) => count + item.quantity, 0),
    };
  }, [cart, isLoggedIn, wishlist]);

  const handleStartEditing = () => {
    setIsEditing(true);
    setProfileError(null);
    setProfileSuccess(null);
    setProfileName(user?.name ?? "");
    setProfileEmail(user?.email ?? "");
    setProfilePassword("");
    setProfileConfirmPassword("");
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setProfileError(null);
    setProfileName(user?.name ?? "");
    setProfileEmail(user?.email ?? "");
    setProfilePassword("");
    setProfileConfirmPassword("");
  };

  const handleSubmitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextName = profileName.trim();
    const nextEmail = profileEmail.trim();
    const nextPassword = profilePassword.trim();
    const nextConfirmPassword = profileConfirmPassword.trim();

    if (!nextName || !nextEmail) {
      setProfileError("Name and email are required");
      return;
    }

    if (nextPassword || nextConfirmPassword) {
      if (!isStrongPassword(nextPassword)) {
        setProfileError(PASSWORD_REQUIREMENT_MESSAGE);
        return;
      }

      if (nextPassword !== nextConfirmPassword) {
        setProfileError("Passwords do not match");
        return;
      }
    }

    setIsSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const updatedUser = await userApi.updateMe({
        name: nextName,
        email: nextEmail,
        ...(nextPassword ? { password: nextPassword } : {}),
      });
      onUserUpdate(updatedUser);
      setIsEditing(false);
      setProfilePassword("");
      setProfileConfirmPassword("");
      setProfileSuccess("Profile updated");
    } catch (err) {
      setProfileError(
        getUserFriendlyErrorMessage(
          err,
          "We couldn't update your profile. Please try again.",
        ),
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

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

          {isEditing ? (
            <form
              className={styles.profile__editForm}
              onSubmit={(event) => void handleSubmitProfile(event)}
            >
              <label className={styles.profile__field}>
                <span>Name</span>
                <input
                  value={profileName}
                  disabled={isSavingProfile}
                  onChange={(event) => setProfileName(event.target.value)}
                />
              </label>
              <label className={styles.profile__field}>
                <span>Email</span>
                <input
                  type="email"
                  value={profileEmail}
                  disabled={isSavingProfile}
                  onChange={(event) => setProfileEmail(event.target.value)}
                />
              </label>
              <div className={styles.profile__passwordSection}>
                <div className={styles.profile__passwordTitle}>
                  Change Password
                </div>
                <p className={styles.profile__passwordHint}>
                  At least 8 characters with letters, numbers, and a special
                  character.
                </p>
                <label className={styles.profile__field}>
                  <span>New password</span>
                  <input
                    type="password"
                    value={profilePassword}
                    disabled={isSavingProfile}
                    autoComplete="new-password"
                    onChange={(event) =>
                      setProfilePassword(event.target.value)
                    }
                  />
                </label>
                <label className={styles.profile__field}>
                  <span>Confirm password</span>
                  <input
                    type="password"
                    value={profileConfirmPassword}
                    disabled={isSavingProfile}
                    autoComplete="new-password"
                    onChange={(event) =>
                      setProfileConfirmPassword(event.target.value)
                    }
                  />
                </label>
              </div>
              <div className={styles.profile__actions}>
                <button
                  className={styles.profile__saveBtn}
                  disabled={isSavingProfile}
                  type="submit"
                >
                  <FiSave /> {isSavingProfile ? "Saving..." : "Save"}
                </button>
                <button
                  className={styles.profile__cancelBtn}
                  disabled={isSavingProfile}
                  type="button"
                  onClick={handleCancelEditing}
                >
                  <FiX /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h2 className={styles.profile__name}>{user?.name || "User"}</h2>
              <p className={styles.profile__email}>{user?.email}</p>
              <div className={styles.profile__actions}>
                <button
                  className={styles.profile__editBtn}
                  type="button"
                  onClick={handleStartEditing}
                >
                  <FiEdit2 /> Edit
                </button>
                <button
                  className={styles.profile__logoutBtn}
                  onClick={onLogout}
                >
                  <FiLogOut /> Logout
                </button>
              </div>
            </>
          )}

          {profileError ? (
            <p className={styles.profile__error}>{profileError}</p>
          ) : null}
          {profileSuccess ? (
            <p className={styles.profile__success}>{profileSuccess}</p>
          ) : null}
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
          {wishlistLoading ? (
            <p className={styles.profile__emptyMessage}>Loading wishlist...</p>
          ) : wishlistError ? (
            <p className={styles.profile__emptyMessage}>{wishlistError}</p>
          ) : userData.recentWishlist.length > 0 ? (
            <div className={styles.profile__recentGrid}>
              {userData.recentWishlist.map((item) => (
                <div
                  key={item.productId}
                  className={styles.profile__recentItem}
                >
                  <img src={item.imageUrl} alt={item.name} />
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
