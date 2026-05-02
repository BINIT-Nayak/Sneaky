import { useEffect, useState } from "react";

import { TiThMenu } from "react-icons/ti";

import { useIsMobile } from "../../hooks/useIsMobile";
import { NavBar } from "../NavBar/NavBar";

import styles from "./ResponsiveNav.module.css";

export const ResponsiveNav = () => {
  const isMobile = useIsMobile();

  /* ── Desktop / tablet: NavBar is fixed, no extra wrapper needed ── */
  if (!isMobile) {
    return <NavBar />;
  }

  return <ResponsiveNavMobile />;
};

const ResponsiveNavMobile = () => {
  const [open, setOpen] = useState(false);

  // lock body scroll while mobile nav is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Hamburger trigger */}
      <button
        type="button"
        className={`${styles.responsiveNav__trigger} ${open ? `${styles["responsiveNav__trigger_hidden"]}` : ""}`}
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <TiThMenu size={20} color="var(--base-color5)" />
      </button>

      {/* Backdrop */}
      {open ? (
        <div
          className={styles.responsiveNav__backdrop}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {/* Slide-over panel */}
      <div
        className={`${styles.responsiveNav__panel} ${open ? `${styles["responsiveNav__panel_open"]}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <NavBar />
      </div>
    </>
  );
};
