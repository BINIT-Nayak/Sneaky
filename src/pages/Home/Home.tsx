import type { TouchEvent } from "react";
import { useRef, useEffect, useState, useContext } from "react";
import { useDispatch } from "react-redux";

import { FloatingParticles } from "../../components/FloatingParticles/FloatingParticles";
import { AuthContext } from "../../context/AuthContext";
import { useIsMobile, useIsTablet } from "../../hooks/useGetDeviceType";
import { fetchProducts } from "../../store/fetchAPI/fetchProducts";
import { useSneakyStateSlice } from "../../store/sneakyState/sneakySelectors";
import type { AppDispatch } from "../../store/sneakyStore";

import styles from "./Home.module.css";
import { HomeContent } from "./HomeContent";
import { useHomeActions } from "./useHomeActions";

export const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, onOpenAuth } = useContext(AuthContext);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Redux state
  const products = useSneakyStateSlice.getProducts();
  const productsError = useSneakyStateSlice.getProductsError();

  // Local state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );
  const [showToast, setShowToast] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const currentProduct = products[currentIndex];
  const isFinished = currentIndex >= products.length;
  const { onAddToCart, onDislike, onLike } = useHomeActions({
    currentProduct,
    isLoggedIn,
    onOpenAuth,
    setCurrentIndex,
    setShowAnimation,
    setShowToast,
    setSwipeDirection,
    showAnimation,
  });

  // Fetch products on mount
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  //handles hover glow effect on product card
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

  // Keyboard navigation handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onDislike();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onLike();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDislike, onLike]);

  // Touch swipe handling
  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const touchStart = touchStartRef.current;
    touchStartRef.current = null;
    if (!touchStart) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minimumSwipeDistance = 70;
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) * 1.4;

    if (
      Math.abs(deltaX) < minimumSwipeDistance ||
      !isHorizontalSwipe ||
      showAnimation
    )
      return;

    if (deltaX > 0) {
      onLike();
      return;
    }
    onDislike();
  };

  return (
    <div className={styles.home}>
      {currentProduct ? (
        <FloatingParticles
          color="var(--base-color3)"
          count={6}
          cursorAttraction={!isMobile && !isTablet}
          size={50}
          speed={0.0005}
          velocityBias={0.8}
        />
      ) : null}

      {showToast ? <div className={styles.home__toast}>{showToast}</div> : null}
      <HomeContent
        cardRef={cardRef}
        currentProduct={currentProduct}
        isFinished={isFinished}
        onAddToCart={onAddToCart}
        onDislike={onDislike}
        onLike={onLike}
        onStartOver={() => setCurrentIndex(0)}
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
        productsError={productsError}
        showAnimation={showAnimation}
        swipeDirection={swipeDirection}
      />
    </div>
  );
};
