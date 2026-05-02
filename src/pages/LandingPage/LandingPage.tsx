import type { FC } from "react";
import { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { GiRoundStar } from "react-icons/gi";

import { AuthContext } from "../../context/AuthContext";

import styles from "./LandingPage.module.css";

export const LandingPage: FC = () => {
  const navigate = useNavigate();
  const { onOpenAuth } = useContext(AuthContext);
  const particlesRef = useRef<HTMLDivElement>(null);

  // Particle animation effect
  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    const particleCount = 20;

    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0009,
      vy: (Math.random() - 0.5) * 0.0009,
    }));

    const elements: HTMLDivElement[] = [];

    // create elements
    particles.forEach(() => {
      const el = document.createElement("div");
      el.className = styles.start__particle;
      container.appendChild(el);
      elements.push(el);
    });

    let frameId: number;

    const animate = () => {
      const width = container.clientWidth - 50;
      const height = container.clientHeight - 50;

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        // bounce within container (0 → 1 normalized space)
        if (p.x <= 0 || p.x >= 1) p.vx *= -1;
        if (p.y <= 0 || p.y >= 1) p.vy *= -1;

        const el = elements[i];

        el.style.transform = `translate(${p.x * width}px, ${p.y * height}px)`;
      });

      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      container.innerHTML = "";
    };
  }, []);

  const handleStartSwiping = () => {
    navigate("/home");
  };

  const handleSignIn = () => {
    onOpenAuth();
  };

  return (
    <div className={styles.start}>
      <div className={styles.start__particles} ref={particlesRef} />

      <div className={styles.start__content}>
        {/* Brand */}
        <div className={styles.start__brand}>
          <div className={styles.start__eyebrow}>WELCOME TO</div>
          <h1 className={styles.start__title}>Sneaky</h1>
          <span className={styles.start__subtitle}>
            DISCOVER FASHION THE FUN WAY
          </span>
        </div>

        {/* Decorative divider */}
        <div className={styles.start__divider}>
          <span className={styles.start__divider__line} />
          <span className={styles.start__divider__dot} />
          <span className={styles.start__divider__line} />
        </div>

        {/* Tagline */}
        <div className={styles.start__tagline}>
          <div className={styles.start__taglineRow}>
            <span
              className={`${styles.start__taglineWord} ${styles["start__taglineWord_accent"]}`}
            >
              Swipe.
            </span>
            <span className={styles.start__taglineDot} aria-hidden="true" />
            <span className={styles.start__taglineWord}>Style.</span>
            <span className={styles.start__taglineDot} aria-hidden="true" />
            <span
              className={`${styles.start__taglineWord} ${styles["start__taglineWord_accent"]}`}
            >
              Shop.
            </span>
            <span className={styles.start__taglineDot} aria-hidden="true" />
            <span className={styles.start__taglineWord}>Repeat.</span>
          </div>
        </div>

        {/* Description */}
        <p className={styles.start__description}>
          The most exciting way to discover fashion that matches your unique
          style. Swipe through curated collections and build your wishlist with
          our immersive card-based interface.
        </p>

        {/* CTA buttons - DONO BUTTONS YAHAN HAIN */}
        <div className={styles.start__actions}>
          <button
            className={`${styles.start__btn} ${styles["start__btn_primary"]}`}
            onClick={handleStartSwiping}
          >
            Start Swiping
          </button>
          <button
            className={`${styles.start__btn} ${styles["start__btn_secondary"]}`}
            onClick={handleSignIn}
          >
            Sign In
          </button>
        </div>

        {/* Feature pills */}
        <div className={styles.start__features}>
          <div className={styles.start__feature}>
            <span className={styles.start__featureIcon}>
              <FiHeart />
            </span>
            <span className={styles.start__featureLabel}>Swipe to Like</span>
          </div>

          <div className={styles.start__feature}>
            <span className={styles.start__featureIcon}>
              <GiRoundStar />
            </span>
            <span className={styles.start__featureLabel}>Save to Wishlist</span>
          </div>

          <div className={styles.start__feature}>
            <span className={styles.start__featureIcon}>
              <FiShoppingCart />
            </span>
            <span className={styles.start__featureLabel}>Add to Cart</span>
          </div>
        </div>

        {/* Small note about sign in */}
        <p className={styles.start__note}>
          ✦ Sign in to save your wishlist and cart ✦
        </p>
      </div>
    </div>
  );
};
