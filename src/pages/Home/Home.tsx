import { useRef, useEffect, useState, useContext } from "react";

import { Button } from "../../components/Button/Button";
import { ButtonVariant } from "../../components/Button/type";
import { SwipeButton } from "../../components/SwipeButton/SwipeButton";
import { SwipeButtonType } from "../../components/SwipeButton/type";
import { AuthContext } from "../../context/AuthContext";
import { useIsMobile, useIsTablet } from "../../hooks/useGetDeviceType";
import type { Product } from "../../samples/product";
import { sampleProducts } from "../../samples/product";
import { addToWishlist, addToCart } from "../../utils/storage";

import styles from "./Home.module.css";

export const Home = () => {
  const { isLoggedIn, onOpenAuth } = useContext(AuthContext);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [products] = useState<Product[]>(sampleProducts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );
  const [showToast, setShowToast] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const currentProduct = products[currentIndex];
  const isFinished = currentIndex >= products.length;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mouse-x", `${x}%`);
      card.style.setProperty("--mouse-y", `${y}%`);
    };

    card.addEventListener("mousemove", handleMouseMove);
    return () => card.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const showToastMessage = (message: string) => {
    setShowToast(message);
    setTimeout(() => setShowToast(null), 2000);
  };

  const onLike = () => {
    if (!isLoggedIn) {
      onOpenAuth(); // Open login modal
      showToastMessage("🔐 Please sign in to add to wishlist");
      return;
    }
    if (currentProduct) {
      setSwipeDirection("right");
      setShowAnimation(true);
      addToWishlist(currentProduct);
      showToastMessage(`❤️ Added ${currentProduct.name} to wishlist!`);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setShowAnimation(false);
        setSwipeDirection(null);
      }, 300);
    }
  };

  const onDislike = () => {
    setSwipeDirection("left");
    setShowAnimation(true);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setShowAnimation(false);
      setSwipeDirection(null);
    }, 300);
  };

  const onAddToCart = () => {
    if (!isLoggedIn) {
      onOpenAuth(); // Open login modal
      showToastMessage("🔐 Please sign in to add to cart");
      return;
    }
    if (currentProduct) {
      addToCart(currentProduct);
      showToastMessage(`🛒 Added ${currentProduct.name} to cart!`);
    }
  };

  // Particle animation effect
  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    let mouseX = 0.5;
    let mouseY = 0.5;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = (e.clientY - rect.top) / rect.height;
    };

    container.addEventListener("mousemove", handleMouseMove);

    const particleCount = 6;

    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.8) * 0.0005,
      vy: (Math.random() - 0.8) * 0.0005,
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
        // base movement
        p.x += p.vx;
        p.y += p.vy;

        // attraction toward cursor (desktop only)
        if (!isMobile && !isTablet) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;

          const distance = Math.sqrt(dx * dx + dy * dy);

          const attractionRadius = 0.2; // adjust this
          const strength = 0.002; // adjust this

          if (distance < attractionRadius) {
            p.vx += dx * strength;
            p.vy += dy * strength;
          }

          // damping (prevents crazy speed)
          p.vx *= 0.98;
          p.vy *= 0.98;
        }
        // bounce
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
      container.removeEventListener("mousemove", handleMouseMove);
      container.innerHTML = "";
    };
  }, [isMobile, isTablet]);

  if (isFinished) {
    return (
      <div className={styles.home}>
        <div className={styles.home__card}>
          <div className={styles.home__finished}>
            <h2>🎉 You've seen all products! 🎉</h2>
            <p>Check your wishlist and cart for your favorites</p>
            <Button
              variant={ButtonVariant.DEFAULT}
              glow
              onClick={() => setCurrentIndex(0)}
            >
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className={styles.home}>
        <div className={styles.home__card}>
          <div className={styles.home__loading}>
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.home}>
      <div className={styles.start__particles} ref={particlesRef} />
      {/* Toast Notification */}
      {showToast ? <div className={styles.home__toast}>{showToast}</div> : null}

      <div
        className={`${styles.home__card} ${showAnimation ? styles[`swipe_${swipeDirection}`] : ""}`}
        ref={cardRef}
      >
        {/* Product Image */}
        <div className={styles.home__feed}>
          <img
            src={currentProduct.image}
            alt={currentProduct.name}
            className={styles.home__image}
            loading="lazy"
          />

          {/* Product Info Overlay */}
          <div className={styles.home__productInfo}>
            <h3 className={styles.home__productName}>{currentProduct.name}</h3>
            <p className={styles.home__productBrand}>{currentProduct.brand}</p>
            <p className={styles.home__productPrice}>
              ₹{currentProduct.price.toLocaleString()}
            </p>
            <p className={styles.home__productDesc}>
              {currentProduct.description}
            </p>
          </div>
        </div>

        {/* Bottom controls overlay */}
        <div className={styles.home__controls}>
          <div className={styles.home__controls__detail}>
            <Button
              variant={ButtonVariant.NEUMORPHIC}
              style={{ maxWidth: "280px", width: "100%" }}
              glow
            >
              ✦ See Details ✦
            </Button>
          </div>

          <div className={styles.home__controls__actions}>
            <button
              className={`${styles.home__actionBtn} ${styles.home__actionBtn_dislike}`}
              onClick={onDislike}
              aria-label="Dislike"
            >
              <SwipeButton type={SwipeButtonType.DISLIKE} />
            </button>
            <button
              className={`${styles.home__actionBtn} ${styles.home__actionBtn_cart}`}
              onClick={onAddToCart}
              aria-label="Add to Cart"
            >
              <SwipeButton type={SwipeButtonType.CART} />
            </button>
            <button
              className={`${styles.home__actionBtn} ${styles.home__actionBtn_like}`}
              onClick={onLike}
              aria-label="Like / Add to Wishlist"
            >
              <SwipeButton type={SwipeButtonType.LIKE} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
