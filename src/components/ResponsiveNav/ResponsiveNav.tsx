import { useEffect, useState } from "react";

import { TiThMenu } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";

import { NavBar } from "../NavBar/NavBar";

import styles from "./ResponsiveNav.module.css";
import { useClasses } from "../../hooks/useClasses";

const MOBILE_BREAKPOINT = 1040;

export const ResponsiveNav = () => {
  const [showNavBar, setShowNavBar] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= MOBILE_BREAKPOINT;

      setIsMobile(mobile);
      setShowNavBar(!mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleNavBarToggle = () => {
    setShowNavBar((prev) => !prev);
  };

  const navPanelMod = useClasses(styles, "responsiveNav__panel", {
    open: showNavBar,
  });

  const placeHolderMod = useClasses(styles, "responsiveNav__placeholder", {
    hidden: showNavBar,
  });

  if (!isMobile) {
    return <NavBar />;
  }

  return (
    <div
      className={`${styles.responsiveNav} ${
        showNavBar ? `${styles.responsiveNav_open} responsiveNav_open` : ""
      }`}
    >
      <button
        type="button"
        className={placeHolderMod}
        onClick={handleNavBarToggle}
        aria-label="Open navigation"
        aria-expanded={showNavBar}
      >
        <TiThMenu size={30} color="var(--base-color2)" />
      </button>

      <div className={navPanelMod}>
        <NavBar />
        <button
          type="button"
          className={styles.responsiveNav__closeButton}
          onClick={() => setShowNavBar(false)}
          aria-label="Close navigation"
        >
          <RxCross2 size={24} color="var(--base-color2)" />
        </button>
      </div>
    </div>
  );
};
