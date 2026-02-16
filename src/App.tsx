import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { NavBar } from "./components/NavBar/NavBar";

import "./index.css";

export const App = () => {
  const [showNavBar, setShowNavBar] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setShowNavBar(window.innerWidth > 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="app">
      {showNavBar ? <NavBar /> : null}
      <div style={{ width: "100%" }}>
        <Outlet />
      </div>
    </div>
  );
};
