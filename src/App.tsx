import { Outlet } from "react-router-dom";

import { ResponsiveNav } from "./components/ResponsiveNav/ResponsiveNav";

import "./index.css";

export const App = () => {
  return (
    <div className="app">
      <ResponsiveNav />
      <div className="outletContainer">
        <Outlet />
      </div>
    </div>
  );
};
