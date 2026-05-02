import { useCallback, useMemo, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";

import { ResponsiveNav } from "./components/ResponsiveNav/ResponsiveNav";
import { AuthEntryLoginButton } from "./components/AuthEntryLoginButton/AuthEntryLoginButton";
import { AuthModal } from "./pages/Auth/AuthModal";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { Home } from "./pages/Home/Home";
import { Wishlist } from "./pages/WishList/Wishlist";
import { Cart } from "./pages/Cart/Cart";
import { Profile } from "./pages/Profile/Profile";
import { AuthContext } from "./context/AuthContext";
import type { UserType } from "./context/AuthContext";
import { sneakyStateActions } from "./store/sneakySlice";
import { useSneakyStateSlice } from "./store/sneakySelectors";
import type { AppDispatch } from "./store/sneakyStore";

import styles from "./index.module.css";

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

export const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthModalOpen = useSneakyStateSlice.getIsAuthModalOpen();
  const { user: initialUser, isLoggedIn: initialIsLoggedIn } =
    getInitialAuthState();
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
  const [user, setUser] = useState<UserType | null>(initialUser);

  const handleLogin = (email: string, _password: string) => {
    // Validate inputs (password validation would be implemented with real authentication)
    if (!email || !_password) {
      console.warn("Email and password are required");
      return;
    }

    const userData = {
      email: email,
    };

    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem("sneaky_user", JSON.stringify(userData));
    dispatch(sneakyStateActions.setAuthModalOpen(false));
  };

  const handleSignUp = (name: string, email: string, _password: string) => {
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
    setIsLoggedIn(true);
    localStorage.setItem("sneaky_user", JSON.stringify(userData));
    dispatch(sneakyStateActions.setAuthModalOpen(false));
  };

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("sneaky_user");
    // Note: We don't clear wishlist/cart on logout - they persist
  }, []);

  const handleOpenAuth = useCallback(() => {
    dispatch(sneakyStateActions.setAuthModalOpen(true));
  }, [dispatch]);

  const handleCloseAuth = useCallback(() => {
    dispatch(sneakyStateActions.setAuthModalOpen(false));
  }, [dispatch]);

  const contextValue = useMemo(
    () => ({
      isLoggedIn,
      onOpenAuth: handleOpenAuth,
      onLogout: handleLogout,
      user,
    }),
    [handleOpenAuth, handleLogout, isLoggedIn, user],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      <div className={styles.app}>
        <ResponsiveNav />

        <main className={styles.app__main}>
          {isLoggedIn === false ? (
            <AuthEntryLoginButton onOpenAuth={handleOpenAuth} />
          ) : null}

          <div className={styles.app__content}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<Home />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </main>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuth}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
      />
    </AuthContext.Provider>
  );
};
