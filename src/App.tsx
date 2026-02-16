import { Outlet } from "react-router-dom";

import { ResponsiveNav } from "./components/ResponsiveNav/ResponsiveNav";
import { useIsMobile } from "./hooks/useIsMobile";
import { FaSignInAlt } from "react-icons/fa";

import "./index.css";

export const App = () => {
  const ismobile = useIsMobile();
  return (
    <div className="app">
      <ResponsiveNav />
      {ismobile && (
        <div className="loginButton">
          <FaSignInAlt size={25} color="var(--base-color2)" />
        </div>
      )}
      <div className="outletContainer">
        <Outlet />
      </div>
    </div>
  );
};
