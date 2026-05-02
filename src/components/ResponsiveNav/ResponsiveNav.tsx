import { useEffect, useState } from "react";

import { TiThMenu } from "react-icons/ti";

import { getClasses } from "../../hooks/useClasses";
import { useIsMobile } from "../../hooks/useGetDeviceType";
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

  const responsiveNavMod = getClasses(styles, "responsiveNav__trigger", {
    hidden: open,
  });
  const responsivePanelMod = getClasses(styles, "responsiveNav__panel", {
    open,
  });

  return (
    <>
      {/* Hamburger trigger */}
      <button
        type="button"
        className={responsiveNavMod}
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
        className={responsivePanelMod}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <NavBar />
      </div>
    </>
  );
};
