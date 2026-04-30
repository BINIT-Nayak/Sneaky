// src/pages/Start/Start.tsx
import { type FC, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { GiRoundStar } from "react-icons/gi";
import { AuthContext } from "../../App";
import styles from "./LandingPage.module.css";

export const LandingPage: FC = () => {
  const navigate = useNavigate();
  const { onOpenAuth } = useContext(AuthContext);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!particlesRef.current) return;

    const particles = particlesRef.current;
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = styles.start__particle;
      
      const size = Math.random() * 6 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particle.style.animationDuration = `${Math.random() * 10 + 5}s`;
      
      particles.appendChild(particle);
    }

    return () => {
      particles.innerHTML = '';
    };
  }, []);

  const handleStartSwiping = () => {
    // Direct home page - no login required
    navigate("/home");
  };

  const handleSignIn = () => {
    // Open auth modal
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
          <span className={styles.start__subtitle}>DISCOVER FASHION THE FUN WAY</span>
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
            <span className={`${styles.start__taglineWord} ${styles["start__taglineWord_accent"]}`}>
              Swipe.
            </span>
            <span className={styles.start__taglineDot} aria-hidden="true" />
            <span className={styles.start__taglineWord}>Style.</span>
            <span className={styles.start__taglineDot} aria-hidden="true" />
            <span className={`${styles.start__taglineWord} ${styles["start__taglineWord_accent"]}`}>
              Shop.
            </span>
            <span className={styles.start__taglineDot} aria-hidden="true" />
            <span className={styles.start__taglineWord}>Repeat.</span>
          </div>
        </div>

        {/* Description */}
        <p className={styles.start__description}>
          The most exciting way to discover fashion that matches your unique style.
          Swipe through curated collections and build your wishlist with our 
          immersive card-based interface.
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