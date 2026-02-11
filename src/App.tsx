import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar/NavBar";

import { Home } from "./pages/Home";
import { Wishlist } from "./pages/Wishlist";
import { Cart } from "./pages/Cart";
import { Profile } from "./pages/Profile";

import "./index.css";

export const App = () => {
  return (
    <div className="app">
      <BrowserRouter>
        <NavBar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};
