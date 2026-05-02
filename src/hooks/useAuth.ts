import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import type { UserType } from "../context/AuthContext";
import { useSneakyStateSlice } from "../store/sneakyState/sneakySelectors";
import { sneakyStateActions } from "../store/sneakyState/sneakySlice";
import type { AppDispatch } from "../store/sneakyStore";

// Initialize state from localStorage for hydration
const getInitialAuthState = () => {
  const savedUser = localStorage.getItem("sneaky_user");
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
  const { user: initialUser, isLoggedIn: initialIsLoggedIn } =
    getInitialAuthState();
  const [user, setUser] = useState<UserType | null>(initialUser);
  const isLoggedIn = useSneakyStateSlice.getIsLoggedIn();

  useEffect(() => {
    if (initialIsLoggedIn) {
      dispatch(sneakyStateActions.setIsLoggedIn(true));
    }
  }, [dispatch, initialIsLoggedIn]);

  const handleLogin = useCallback(
    (email: string, _password: string) => {
      // Validate inputs (password validation would be implemented with real authentication)
      if (!email || !_password) {
        console.warn("Email and password are required");
        return;
      }

      const userData = {
        email: email,
      };

      setUser(userData);
      localStorage.setItem("sneaky_user", JSON.stringify(userData));
      dispatch(sneakyStateActions.setIsLoggedIn(true));
      dispatch(sneakyStateActions.setAuthModalOpen(false));
    },
    [dispatch],
  );

  const handleSignUp = useCallback(
    (name: string, email: string, _password: string) => {
      // Validate inputs (password validation would be implemented with real authentication)
      if (!name || !email || !_password) {
        console.warn("Name, email, and password are required");
        return;
      }

      const userData = {
        name: name,
        email: email,
      };

      setUser(userData);
      localStorage.setItem("sneaky_user", JSON.stringify(userData));
      dispatch(sneakyStateActions.setIsLoggedIn(true));
      dispatch(sneakyStateActions.setAuthModalOpen(false));
    },
    [dispatch],
  );

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("sneaky_user");
    dispatch(sneakyStateActions.setIsLoggedIn(false));
    // Note: We don't clear wishlist/cart on logout - they persist
  }, [dispatch]);

  const handleOpenAuth = useCallback(() => {
    dispatch(sneakyStateActions.setAuthModalOpen(true));
  }, [dispatch]);

  const handleCloseAuth = useCallback(() => {
    dispatch(sneakyStateActions.setAuthModalOpen(false));
  }, [dispatch]);

  return {
    isLoggedIn,
    user,
    handleLogin,
    handleSignUp,
    handleLogout,
    handleOpenAuth,
    handleCloseAuth,
  };
};
