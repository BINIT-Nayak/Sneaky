import { Outlet } from "react-router-dom";

import { ResponsiveNav } from "./components/ResponsiveNav/ResponsiveNav";
import { useIsMobile } from "./hooks/useIsMobile";

import "./index.css";
import { AuthEntryLoginButton } from "./components/AuthEntryLoginButton/AuthEntryLoginButton";

export const App = () => {
  const ismobile = useIsMobile();
  return (
    <div className="app">
      <ResponsiveNav />
      {ismobile ? <AuthEntryLoginButton /> : null}
      <div className="outletContainer">
        <Outlet />
      </div>
    </div>
  );
};
