// src/App.tsx
import { useState, createContext, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import { ResponsiveNav } from "./components/ResponsiveNav/ResponsiveNav";
import { AuthEntryLoginButton } from "./components/AuthEntryLoginButton/AuthEntryLoginButton";
import { AuthModal } from "./pages/Auth/AuthModal";
import { Start } from "./pages/Start/Start";
import { Home } from "./pages/Home/Home";
import { Wishlist } from "./pages/WishList/Wishlist";
import { Cart } from "./pages/Cart/Cart";
import { Profile } from "./pages/Profile/Profile";

import "./index.css";

interface AuthContextType {
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  onLogout: () => void;
  user: UserType | null;
}

interface UserType {
  name: string;
  email: string;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  onOpenAuth: () => {},
  onLogout: () => {},
  user: null,
});

export const App = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('sneaky_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (email: string, password: string) => {
    console.log("Login:", { email, password });
    
    const userData = {
      name: email.split('@')[0],
      email: email,
    };
    
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('sneaky_user', JSON.stringify(userData));
    setIsAuthModalOpen(false);
  };

  const handleSignUp = (name: string, email: string, password: string) => {
    console.log("Sign Up:", { name, email, password });
    
    const userData = {
      name: name,
      email: email,
    };
    
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('sneaky_user', JSON.stringify(userData));
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('sneaky_user');
  };

  const handleOpenAuth = () => {
    setIsAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      onOpenAuth: handleOpenAuth,
      onLogout: handleLogout,
      user 
    }}>
      <div className="app">

        {/* Navbar hamesha dikhega */}
        <ResponsiveNav />

        <main className="app__main">
          {/* Login button sirf tab dikhe jab user logged in na ho */}
          {!isLoggedIn && (
            <AuthEntryLoginButton onOpenAuth={handleOpenAuth} />
          )}

          <div className="app__content">
            <Routes>
              {/* Sab routes accessible hain bina login ke */}
              <Route path="/" element={<Start />} />
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
