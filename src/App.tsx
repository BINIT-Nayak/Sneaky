import { useEffect, useMemo, useRef } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import bellIcon from "./assets/bell.png";
import emptyList from "./assets/emptyList.png";
import { AuthEntryLoginButton } from "./components/AuthEntryLoginButton/AuthEntryLoginButton";
import { ResponsiveNav } from "./components/ResponsiveNav/ResponsiveNav";
import { AuthContext } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import styles from "./index.module.css";
import { Admin } from "./pages/Admin/Admin";
import { AuthModal } from "./pages/Auth/AuthModal";
import { Cart } from "./pages/Cart/Cart";
import { Home } from "./pages/Home/Home";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { Notifications } from "./pages/Notifications/Notifications";
import { Profile } from "./pages/Profile/Profile";
import { Wishlist } from "./pages/WishList/Wishlist";
import { useSneakyStateSlice } from "./store/sneakyState/sneakySelectors";
import { isAdminRole } from "./utils/roles";

export const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const wasLoggedIn = useRef(false);
  const {
    isLoggedIn,
    user,
    handleLogin,
    handleSignUp,
    handleLogout,
    handleOpenAuth,
    handleCloseAuth,
    handleUserUpdate,
    authError,
    isAuthLoading,
  } = useAuth();

  const isAuthModalOpen = useSneakyStateSlice.getIsAuthModalOpen();
  const isAdmin = isAdminRole(user?.role);

  useEffect(() => {
    if (isLoggedIn && isAdmin && !wasLoggedIn.current) {
      navigate("/admin", { replace: true });
    }

    wasLoggedIn.current = isLoggedIn;
  }, [isAdmin, isLoggedIn, navigate]);

  useEffect(() => {
    if (isLoggedIn && isAdmin && location.pathname === "/profile") {
      navigate("/admin", { replace: true });
    }
  }, [isAdmin, isLoggedIn, location.pathname, navigate]);

  const contextValue = useMemo(
    () => ({
      isLoggedIn,
      onOpenAuth: handleOpenAuth,
      onLogout: handleLogout,
      onUserUpdate: handleUserUpdate,
      user,
    }),
    [handleOpenAuth, handleLogout, handleUserUpdate, isLoggedIn, user],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      <div className={styles.app}>
        <div className={styles.app__assetPreloader} aria-hidden="true">
          <img src={bellIcon} alt="" decoding="async" />
          <img src={emptyList} alt="" decoding="async" />
        </div>

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
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </div>
        </main>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuth}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        error={authError}
        isSubmitting={isAuthLoading}
      />
    </AuthContext.Provider>
  );
};
