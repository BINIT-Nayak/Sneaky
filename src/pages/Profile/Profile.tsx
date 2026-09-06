import type { FC } from "react";
import type { FormEvent } from "react";
import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
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
} from "../../components/Icon/Icon";

import { AuthContext } from "../../context/AuthContext";
import { userApi } from "../../services/userAPI";
import { fetchProfileSummary } from "../../store/fetchAPI/fetchProfileSummary";
import { sneakyStateActions } from "../../store/sneakyState/sneakySlice";
import { useSneakyStateSlice } from "../../store/sneakyState/sneakySelectors";
import type { AppDispatch } from "../../store/sneakyStore";
import type { IWishlistItem, ProfileSummary } from "../../store/types";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import {
  isStrongPassword,
  PASSWORD_REQUIREMENT_MESSAGE,
} from "../../utils/passwordValidation";
import { isAdminRole } from "../../utils/roles";

import styles from "./Profile.module.css";

const PROFILE_SUMMARY_CACHE_TTL_MS = 30 * 60 * 1000;

type IdleCallbackHandle = number;

type WindowWithIdleCallback = Window & {
  cancelIdleCallback?: (handle: IdleCallbackHandle) => void;
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => IdleCallbackHandle;
};

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

const getProfileSummaryCacheKey = (userId: string) =>
  `sneaky:profile-summary:${userId}`;

const isWishlistItem = (item: IWishlistItem | null | undefined) =>
  typeof item?.productId === "string" &&
  typeof item.name === "string" &&
  typeof item.imageUrl === "string" &&
  typeof item.brandName === "string" &&
  typeof item.price === "number";

const isProfileSummary = (
  summary: ProfileSummary | null | undefined,
): summary is ProfileSummary =>
  typeof summary?.wishlistCount === "number" &&
  typeof summary.cartCount === "number" &&
  Array.isArray(summary.recentWishlist) &&
  summary.recentWishlist.every(isWishlistItem);

const readCachedProfileSummary = (userId: string): ProfileSummary | null => {
  try {
    const storedValue = window.localStorage.getItem(
      getProfileSummaryCacheKey(userId),
    );
    if (!storedValue) return null;

    const payload = JSON.parse(storedValue) as {
      savedAt?: number;
      summary?: ProfileSummary;
    };

    if (
      typeof payload.savedAt !== "number" ||
      Date.now() - payload.savedAt > PROFILE_SUMMARY_CACHE_TTL_MS ||
      !isProfileSummary(payload.summary)
    ) {
      return null;
    }

    return payload.summary;
  } catch {
    return null;
  }
};

const writeCachedProfileSummary = (
  userId: string,
  summary: ProfileSummary,
) => {
  try {
    window.localStorage.setItem(
      getProfileSummaryCacheKey(userId),
      JSON.stringify({
        savedAt: Date.now(),
        summary,
      }),
    );
  } catch {
    // Profile summary cache is only used to improve reload paint.
  }
};

export const Profile: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
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
  const profileSummary = useSneakyStateSlice.getProfileSummary();
  const profileSummaryStatus = useSneakyStateSlice.getProfileSummaryStatus();
  const isProfileSummaryLoading =
    useSneakyStateSlice.getProfileSummaryLoading();
  const profileSummaryError = useSneakyStateSlice.getProfileSummaryError();
  const isAdmin = isAdminRole(user?.role);

  useEffect(() => {
    if (
      !isAuthReady ||
      !isLoggedIn ||
      isAdmin ||
      !user?.userId ||
      profileSummaryStatus !== "idle"
    )
      return;

    const cachedSummary = readCachedProfileSummary(user.userId);
    if (cachedSummary) {
      dispatch(sneakyStateActions.hydrateProfileSummaryFromCache(cachedSummary));
    }

    const fetchSummary = () => {
      void dispatch(fetchProfileSummary({ forceRefresh: Boolean(cachedSummary) }));
    };

    const idleWindow = window as WindowWithIdleCallback;
    if (idleWindow.requestIdleCallback) {
      const idleHandle = idleWindow.requestIdleCallback(fetchSummary, {
        timeout: 2500,
      });
      return () => idleWindow.cancelIdleCallback?.(idleHandle);
    }

    const timeoutId = window.setTimeout(fetchSummary, 1500);
    return () => window.clearTimeout(timeoutId);
  }, [
    dispatch,
    isAdmin,
    isAuthReady,
    isLoggedIn,
    profileSummaryStatus,
    user?.userId,
  ]);

  useEffect(() => {
    if (!user?.userId || !profileSummary) return;

    writeCachedProfileSummary(user.userId, profileSummary);
  }, [profileSummary, user?.userId]);

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
