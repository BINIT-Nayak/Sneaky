import type { FC } from "react";
import type { FormEvent } from "react";
import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import {
  FiClock,
  FiEdit2,
  FiHeart,
  FiLogOut,
  FiMail,
  FiSave,
  FiShield,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";

import { AuthContext } from "../../context/AuthContext";
import { userApi, type ProfileSummary } from "../../services/userAPI";
import type { IWishlistItem } from "../../store/types";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import {
  isStrongPassword,
  PASSWORD_REQUIREMENT_MESSAGE,
} from "../../utils/passwordValidation";
import { isAdminRole } from "../../utils/roles";

import styles from "./Profile.module.css";

const getInitials = (name?: string | null, email?: string | null) => {
  const source = name?.trim() || email?.trim() || "User";
  const words = source
    .split(/[\s@._-]+/)
    .map((word) => word.trim())
    .filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
};

export const Profile: FC = () => {
  const { isAuthReady, isLoggedIn, user, onLogout, onOpenAuth, onUserUpdate } =
    useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [profileEmail, setProfileEmail] = useState(user?.email ?? "");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(
    null,
  );
  const [isProfileSummaryLoading, setIsProfileSummaryLoading] = useState(false);
  const [profileSummaryError, setProfileSummaryError] = useState<string | null>(
    null,
  );
  const isAdmin = isAdminRole(user?.role);

  useEffect(() => {
    if (!isAuthReady || !isLoggedIn || isAdmin) return;

    let isMounted = true;
    setIsProfileSummaryLoading(true);
    setProfileSummaryError(null);

    void userApi
      .getProfileSummary()
      .then((summary) => {
        if (isMounted) {
          setProfileSummary(summary);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setProfileSummaryError(
            getUserFriendlyErrorMessage(
              err,
              "We couldn't load your profile activity.",
            ),
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsProfileSummaryLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAdmin, isAuthReady, isLoggedIn]);

  useEffect(() => {
    setProfileName(user?.name ?? "");
    setProfileEmail(user?.email ?? "");
  }, [user]);

  const userData: {
    wishlistCount: number;
    cartCount: number;
    recentWishlist: IWishlistItem[];
  } = profileSummary ?? {
    wishlistCount: 0,
    cartCount: 0,
    recentWishlist: [],
  };

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

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profile}>
        {/* Profile Header */}
        <div className={styles.profile__header}>
          <div className={styles.profile__avatar}>
            <span>{getInitials(user?.name, user?.email)}</span>
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
            <div className={styles.profile__display}>
              <p className={styles.profile__eyebrow}>Sneaky account</p>
              <h2 className={styles.profile__name}>{user?.name || "User"}</h2>
              <p className={styles.profile__email}>{user?.email}</p>
              <div className={styles.profile__metaGrid}>
                <div className={styles.profile__metaItem}>
                  <FiMail />
                  <span>{user?.email || "Email connected"}</span>
                </div>
                <div className={styles.profile__metaItem}>
                  <FiShield />
                  <span>Secure profile</span>
                </div>
                <div className={styles.profile__metaItem}>
                  <FiClock />
                  <span>Recommendations tuned from your activity</span>
                </div>
              </div>
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
            </div>
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
            <div className={styles.profile__statIconWrap}>
              <FiHeart className={styles.profile__statIcon} />
            </div>
            <div className={styles.profile__statValue}>
              {userData.wishlistCount}
            </div>
            <div className={styles.profile__statLabel}>Wishlist Items</div>
          </div>
          <div className={styles.profile__statCard}>
            <div className={styles.profile__statIconWrap}>
              <FiShoppingBag className={styles.profile__statIcon} />
            </div>
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
          {isProfileSummaryLoading ? (
            <p className={styles.profile__emptyMessage}>Loading wishlist...</p>
          ) : profileSummaryError ? (
            <p className={styles.profile__emptyMessage}>
              {profileSummaryError}
            </p>
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
