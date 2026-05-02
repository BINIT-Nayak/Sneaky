import { useMemo } from "react";
import { Routes, Route } from "react-router-dom";

import { AuthEntryLoginButton } from "./components/AuthEntryLoginButton/AuthEntryLoginButton";
import { ResponsiveNav } from "./components/ResponsiveNav/ResponsiveNav";
import { AuthContext } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import styles from "./index.module.css";
import { AuthModal } from "./pages/Auth/AuthModal";
import { Cart } from "./pages/Cart/Cart";
import { Home } from "./pages/Home/Home";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { Profile } from "./pages/Profile/Profile";
import { Wishlist } from "./pages/WishList/Wishlist";
import { useSneakyStateSlice } from "./store/sneakyState/sneakySelectors";

export const App = () => {
  const {
    isLoggedIn,
    user,
    handleLogin,
    handleSignUp,
    handleLogout,
    handleOpenAuth,
    handleCloseAuth,
  } = useAuth();

  const isAuthModalOpen = useSneakyStateSlice.getIsAuthModalOpen();

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
