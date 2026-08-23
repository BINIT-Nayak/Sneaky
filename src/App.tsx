import { lazy, Suspense, useEffect, useMemo, useRef } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import { AuthEntryLoginButton } from "./components/AuthEntryLoginButton/AuthEntryLoginButton";
import { ResponsiveNav } from "./components/ResponsiveNav/ResponsiveNav";
import { AuthContext } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { useAuth } from "./hooks/useAuth";
import styles from "./index.module.css";
import { AuthModal } from "./pages/Auth/AuthModal";
import { Home } from "./pages/Home/Home";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { useSneakyStateSlice } from "./store/sneakyState/sneakySelectors";
import { isAdminRole } from "./utils/roles";

const Admin = lazy(() =>
  import("./pages/Admin/Admin").then((module) => ({ default: module.Admin })),
);
const Cart = lazy(() =>
  import("./pages/Cart/Cart").then((module) => ({ default: module.Cart })),
);
const Notifications = lazy(() =>
  import("./pages/Notifications/Notifications").then((module) => ({
    default: module.Notifications,
  })),
);
const Profile = lazy(() =>
  import("./pages/Profile/Profile").then((module) => ({
    default: module.Profile,
  })),
);
const Wishlist = lazy(() =>
  import("./pages/WishList/Wishlist").then((module) => ({
    default: module.Wishlist,
  })),
);

export const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const wasLoggedIn = useRef(false);
  const {
    isLoggedIn,
    isAuthReady,
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
      isAuthReady,
      onOpenAuth: handleOpenAuth,
      onLogout: handleLogout,
      onUserUpdate: handleUserUpdate,
      user,
    }),
    [handleOpenAuth, handleLogout, handleUserUpdate, isAuthReady, isLoggedIn, user],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      <NotificationsProvider>
        <div className={styles.app}>
          <ResponsiveNav />

          <main className={styles.app__main}>
            {isLoggedIn === false ? (
              <AuthEntryLoginButton onOpenAuth={handleOpenAuth} />
            ) : null}

            <div className={styles.app__content}>
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </Suspense>
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
      </NotificationsProvider>
    </AuthContext.Provider>
  );
};
