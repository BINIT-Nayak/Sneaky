import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import type { UserType } from "../context/AuthContext";
import type { AuthResponse } from "../services/api";
import { authApi } from "../services/authAPI";
import { userApi } from "../services/userAPI";
import { useSneakyStateSlice } from "../store/sneakyState/sneakySelectors";
import { sneakyStateActions } from "../store/sneakyState/sneakySlice";
import type { AppDispatch } from "../store/sneakyStore";
import { getAuthErrorMessage } from "../utils/errorMessages";

const USER_STORAGE_KEY = "sneaky_user";
const ACCESS_TOKEN_STORAGE_KEY = "sneaky_access_token";
const REFRESH_TOKEN_STORAGE_KEY = "sneaky_refresh_token";

// Initialize state from localStorage for hydration
const getInitialAuthState = () => {
  const savedUser = localStorage.getItem(USER_STORAGE_KEY);
  const savedAccessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

  if (savedUser && savedAccessToken && savedRefreshToken) {
    try {
      return {
        user: JSON.parse(savedUser) as UserType,
        isLoggedIn: true,
      };
    } catch {
      console.warn("Failed to parse user from localStorage");
      return { user: null, isLoggedIn: false };
    }
  }
  return { user: null, isLoggedIn: false };
};

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: initialUser, isLoggedIn: initialIsLoggedIn } =
    getInitialAuthState();
  const [user, setUser] = useState<UserType | null>(initialUser);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const isLoggedIn = useSneakyStateSlice.getIsLoggedIn();

  const saveAuthSession = useCallback(
    (userData: UserType, authResponse: AuthResponse) => {
      setUser(userData);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, authResponse.accessToken);
      localStorage.setItem(
        REFRESH_TOKEN_STORAGE_KEY,
        authResponse.refreshToken,
      );
      dispatch(sneakyStateActions.setIsLoggedIn(true));
      dispatch(sneakyStateActions.setAuthModalOpen(false));
    },
    [dispatch],
  );

  const clearAuthSession = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    dispatch(sneakyStateActions.resetWishlistState());
    dispatch(sneakyStateActions.resetCartState());
    dispatch(sneakyStateActions.setIsLoggedIn(false));
  }, [dispatch]);

  const handleUserUpdate = useCallback((nextUser: UserType) => {
    setUser(nextUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const currentUser = await userApi.getMe();
    const nextUser = {
      ...currentUser,
      role: currentUser.role,
    };

    setUser(nextUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    dispatch(sneakyStateActions.setIsLoggedIn(true));
    return nextUser;
  }, [dispatch]);

  useEffect(() => {
    if (!initialIsLoggedIn) return;

    void loadCurrentUser().catch(() => {
      clearAuthSession();
    });
  }, [clearAuthSession, initialIsLoggedIn, loadCurrentUser]);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      if (!email || !password) {
        setAuthError("Email and password are required");
        return;
      }

      setIsAuthLoading(true);
      setAuthError(null);
      try {
        const authResponse = await authApi.login({ email, password });
        localStorage.setItem(
          ACCESS_TOKEN_STORAGE_KEY,
          authResponse.accessToken,
        );
        localStorage.setItem(
          REFRESH_TOKEN_STORAGE_KEY,
          authResponse.refreshToken,
        );
        const currentUser = await userApi.getMe();
        saveAuthSession(
          {
            ...currentUser,
            role: authResponse.role ?? currentUser.role,
          },
          authResponse,
        );
      } catch (err) {
        clearAuthSession();
        setAuthError(
          getAuthErrorMessage(err, "We couldn't log you in. Please try again."),
        );
      } finally {
        setIsAuthLoading(false);
      }
    },
    [clearAuthSession, saveAuthSession],
  );

  const handleSignUp = useCallback(
    async (name: string, email: string, password: string) => {
      if (!name || !email || !password) {
        setAuthError("Name, email, and password are required");
        return;
      }

      setIsAuthLoading(true);
      setAuthError(null);
      try {
        const authResponse = await authApi.signUp({ name, email, password });
        localStorage.setItem(
          ACCESS_TOKEN_STORAGE_KEY,
          authResponse.accessToken,
        );
        localStorage.setItem(
          REFRESH_TOKEN_STORAGE_KEY,
          authResponse.refreshToken,
        );
        const currentUser = await userApi.getMe();
        saveAuthSession(
          {
            ...currentUser,
            role: authResponse.role ?? currentUser.role,
          },
          authResponse,
        );
      } catch (err) {
        clearAuthSession();
        setAuthError(
          getAuthErrorMessage(
            err,
            "We couldn't create your account. Please try again.",
          ),
        );
      } finally {
        setIsAuthLoading(false);
      }
    },
    [clearAuthSession, saveAuthSession],
  );

  const handleLogout = useCallback(() => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    clearAuthSession();
    if (refreshToken) {
      void authApi.logout(refreshToken).catch(() => undefined);
    }
  }, [clearAuthSession]);

  const handleOpenAuth = useCallback(() => {
    setAuthError(null);
    dispatch(sneakyStateActions.setAuthModalOpen(true));
  }, [dispatch]);

  const handleCloseAuth = useCallback(() => {
    setAuthError(null);
    dispatch(sneakyStateActions.setAuthModalOpen(false));
  }, [dispatch]);

  return {
    isLoggedIn,
    user,
    authError,
    isAuthLoading,
    handleLogin,
    handleSignUp,
    handleLogout,
    handleOpenAuth,
    handleCloseAuth,
    handleUserUpdate,
  };
};
