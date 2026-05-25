import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import type { UserType } from "../context/AuthContext";
import { authApi } from "../services/authAPI";
import {
  AUTH_UNAUTHORIZED_EVENT,
  clearStoredAuthSession,
  setAccessToken,
  USER_STORAGE_KEY,
} from "../services/authSession";
import type { AuthResponse } from "../services/authTypes";
import { userApi } from "../services/userAPI";
import { useSneakyStateSlice } from "../store/sneakyState/sneakySelectors";
import { sneakyStateActions } from "../store/sneakyState/sneakySlice";
import type { AppDispatch } from "../store/sneakyStore";
import { getAuthErrorMessage } from "../utils/errorMessages";

// Initialize state from localStorage for hydration
const getInitialAuthState = () => {
  const savedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (savedUser) {
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
  const [initialAuthState] = useState(getInitialAuthState);
  const [user, setUser] = useState<UserType | null>(initialAuthState.user);
  const [hasStoredSession, setHasStoredSession] = useState(
    initialAuthState.isLoggedIn,
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const isReduxLoggedIn = useSneakyStateSlice.getIsLoggedIn();
  const isLoggedIn = isReduxLoggedIn || hasStoredSession;

  const saveAuthSession = useCallback(
    (userData: UserType, authResponse: AuthResponse) => {
      setUser(userData);
      setHasStoredSession(true);
      setAccessToken(authResponse.accessToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      dispatch(sneakyStateActions.setIsLoggedIn(true));
      dispatch(sneakyStateActions.setAuthModalOpen(false));
    },
    [dispatch],
  );

  const clearAuthSession = useCallback(() => {
    setUser(null);
    setHasStoredSession(false);
    clearStoredAuthSession();
    dispatch(sneakyStateActions.resetWishlistState());
    dispatch(sneakyStateActions.resetCartState());
    dispatch(sneakyStateActions.setIsLoggedIn(false));
  }, [dispatch]);

  const handleUserUpdate = useCallback((nextUser: UserType) => {
    setUser(nextUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  const loadCurrentUser = useCallback(async () => {
    const authResponse = await authApi.refresh();
    setAccessToken(authResponse.accessToken);
    const currentUser = await userApi.getMe();
    const nextUser = {
      ...currentUser,
      role: currentUser.role,
    };

    setUser(nextUser);
    setHasStoredSession(true);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    dispatch(sneakyStateActions.setIsLoggedIn(true));
    return nextUser;
  }, [dispatch]);

  useEffect(() => {
    if (!initialAuthState.isLoggedIn) return;

    void loadCurrentUser().catch(() => {
      clearAuthSession();
    });
  }, [clearAuthSession, initialAuthState.isLoggedIn, loadCurrentUser]);

  useEffect(() => {
    const handleUnauthorizedSession = () => {
      clearAuthSession();
      setAuthError("Your session expired. Please log in again.");
      dispatch(sneakyStateActions.setAuthModalOpen(true));
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorizedSession);
    return () => {
      window.removeEventListener(
        AUTH_UNAUTHORIZED_EVENT,
        handleUnauthorizedSession,
      );
    };
  }, [clearAuthSession, dispatch]);

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
        setAccessToken(authResponse.accessToken);
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
        setAccessToken(authResponse.accessToken);
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
    clearAuthSession();
    void authApi.logout().catch(() => undefined);
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
