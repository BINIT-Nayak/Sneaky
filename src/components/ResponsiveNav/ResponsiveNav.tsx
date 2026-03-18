// src/components/ResponsiveNav/ResponsiveNav.tsx
import { useEffect, useState } from "react";
import { TiThMenu } from "react-icons/ti";
import { RxCross2 } from "react-icons/rx";
import { NavBar } from "../NavBar/NavBar";
import { useIsMobile } from "../../hooks/useIsMobile";
import styles from "./ResponsiveNav.module.css";

export const ResponsiveNav = () => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  // close panel when switching to desktop
  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [isMobile]);

  // lock body scroll while mobile nav is open
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = open ? "hidden" : "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, isMobile]);

  /* ── Desktop / tablet: NavBar is fixed, no extra wrapper needed ── */
  if (!isMobile) {
    return <NavBar />;
  }

  /* ── Mobile: hamburger + slide-over ── */
  return (
    <>
      {/* Hamburger trigger */}
      <button
        type="button"
        className={`${styles.responsiveNav__trigger}${open ? ` ${styles["responsiveNav__trigger--hidden"]}` : ""}`}
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
      >
        <TiThMenu size={20} color="var(--base-color5)" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className={styles.responsiveNav__backdrop}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-over panel */}
      <div
        className={`${styles.responsiveNav__panel}${open ? ` ${styles["responsiveNav__panel--open"]}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <NavBar />
        <button
          type="button"
          className={styles.responsiveNav__close}
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        >
          <RxCross2 size={20} color="var(--base-color5)" />
        </button>
      </div>
    </>
  );
};