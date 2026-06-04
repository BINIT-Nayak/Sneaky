import type { TouchEvent } from "react";
import { useRef, useEffect, useState, useContext } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { FloatingParticles } from "../../components/FloatingParticles/FloatingParticles";
import { Toast } from "../../components/Toast/Toast";
import { AuthContext } from "../../context/AuthContext";
import { useIsMobile, useIsTablet } from "../../hooks/useGetDeviceType";
import { fetchProducts } from "../../store/fetchAPI/fetchProducts";
import { useSneakyStateSlice } from "../../store/sneakyState/sneakySelectors";
import type { AppDispatch } from "../../store/sneakyStore";
import { isAdminRole } from "../../utils/roles";

import styles from "./Home.module.css";
import { HomeContent } from "./HomeContent";
import type { ToastMessage } from "./useHomeActions";
import { useHomeActions } from "./useHomeActions";

const RECENTLY_VIEWED_STORAGE_KEY = "sneaky:recently-viewed-products";
const SWIPED_PRODUCTS_STORAGE_KEY = "sneaky:home-swiped-product-ids";
const RECENTLY_VIEWED_STORAGE_LIMIT = 3;
const RECENTLY_VIEWED_VISIBLE_LIMIT = 2;
const RECOMMENDATION_PREFETCH_THRESHOLD = 10;

const readStoredIds = (storage: Storage, key: string, limit?: number) => {
  try {
    const storedValue = storage.getItem(key);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];
    const ids = Array.isArray(parsedValue)
      ? parsedValue.filter((id): id is string => typeof id === "string")
      : [];

    return typeof limit === "number" ? ids.slice(0, limit) : ids;
  } catch {
    return [];
  }
};

const readRecentlyViewedIds = () =>
  readStoredIds(
    window.localStorage,
    RECENTLY_VIEWED_STORAGE_KEY,
    RECENTLY_VIEWED_STORAGE_LIMIT,
  );

const readSwipedProductIds = () =>
  readStoredIds(window.sessionStorage, SWIPED_PRODUCTS_STORAGE_KEY);

const writeStoredIds = (storage: Storage, key: string, ids: string[]) => {
  try {
    storage.setItem(key, JSON.stringify(ids));
  } catch {
    // Browser storage can be unavailable in private browsing or test contexts.
  }
};

const writeRecentlyViewedIds = (ids: string[]) =>
  writeStoredIds(window.localStorage, RECENTLY_VIEWED_STORAGE_KEY, ids);

const writeSwipedProductIds = (ids: string[]) =>
  writeStoredIds(window.sessionStorage, SWIPED_PRODUCTS_STORAGE_KEY, ids);

export const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoggedIn, onOpenAuth, user } = useContext(AuthContext);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Redux state
  const products = useSneakyStateSlice.getProducts();
  const productsLoading = useSneakyStateSlice.getProductsLoading();
  const productsError = useSneakyStateSlice.getProductsError();

  // Local state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );
  const [showToast, setShowToast] = useState<ToastMessage | null>(null);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() =>
    readRecentlyViewedIds(),
  );
  const [swipedProductIds, setSwipedProductIds] = useState<string[]>(() =>
    readSwipedProductIds(),
  );
  const [lastProductsError, setLastProductsError] = useState<string | null>(
    null,
  );
  const cardRef = useRef<HTMLDivElement>(null);
  const lastPrefetchRemainingRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const isAdmin = isAdminRole(user?.role);
  const feedProducts = products.filter(
    (product) => !swipedProductIds.includes(product.id),
  );
  const currentProduct = feedProducts[currentIndex];
  const isFinished = !productsLoading && currentIndex >= feedProducts.length;
  const recentlyViewedProducts = recentlyViewedIds
    .filter((productId) => productId !== currentProduct?.id)
    .map((productId) =>
      products.find((product) => product.id === productId),
    )
    .filter(
      (product): product is (typeof products)[number] => Boolean(product),
    )
    .slice(0, RECENTLY_VIEWED_VISIBLE_LIMIT);
  const { onAddToCart, onDislike, onLike } = useHomeActions({
    currentProduct,
    isLoggedIn,
    onOpenAuth,
    onProductSwiped: (product) => {
      setSwipedProductIds((previousIds) => {
        const nextIds = previousIds.includes(product.id)
          ? previousIds
          : [...previousIds, product.id];

        writeSwipedProductIds(nextIds);
        return nextIds;
      });
    },
    setCurrentIndex,
    setShowAnimation,
    setShowToast,
    setSwipeDirection,
    showAnimation,
  });

  // Fetch products on mount
  useEffect(() => {
    if (products.length > 0 || productsLoading || productsError) return;

    dispatch(fetchProducts());
  }, [dispatch, products.length, productsError, productsLoading]);

  useEffect(() => {
    if (
      products.length === 0 ||
      products.length <= RECOMMENDATION_PREFETCH_THRESHOLD ||
      productsLoading ||
      productsError ||
      feedProducts.length === 0
    )
      return;

    const remainingProducts = feedProducts.length - currentIndex;

    if (
      remainingProducts > RECOMMENDATION_PREFETCH_THRESHOLD ||
      lastPrefetchRemainingRef.current === remainingProducts
    )
      return;

    lastPrefetchRemainingRef.current = remainingProducts;
    dispatch(
      fetchProducts({
        excludeProductIds: products.map((product) => product.id),
      }),
    );
  }, [
    currentIndex,
    dispatch,
    feedProducts.length,
    products,
    productsError,
    productsLoading,
  ]);

  useEffect(() => {
    if (!currentProduct) return;

    setRecentlyViewedIds((previousIds) => {
      const nextIds = [
        currentProduct.id,
        ...previousIds.filter((id) => id !== currentProduct.id),
      ].slice(0, RECENTLY_VIEWED_STORAGE_LIMIT);

      writeRecentlyViewedIds(nextIds);
      return nextIds;
    });
  }, [currentProduct]);

  useEffect(() => {
    if (!productsError || productsError === lastProductsError) return;

    setShowToast({
      id: Date.now(),
      message: productsError,
    });
    setLastProductsError(productsError);

    const timer = window.setTimeout(() => {
      setShowToast(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [lastProductsError, productsError]);

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

      <Toast key={showToast?.id} message={showToast?.message} />
      <HomeContent
        cardRef={cardRef}
        currentProduct={currentProduct}
        isAdmin={isAdmin}
        isFinished={isFinished}
        isLoading={productsLoading}
        isDetailsOpen={isDetailsOpen}
        onAddToCart={onAddToCart}
        onCloseDetails={() => setIsDetailsOpen(false)}
        onDislike={onDislike}
        onEditProduct={(productId) => {
          navigate("/admin", {
            state: { editProductId: productId },
          });
        }}
        onLike={onLike}
        onOpenDetails={() => setIsDetailsOpen(true)}
        onOpenRecentlyViewed={(productId) => {
          const nextIndex = feedProducts.findIndex(
            (product) => product.id === productId,
          );
          if (nextIndex >= 0) {
            setCurrentIndex(nextIndex);
            setIsDetailsOpen(false);
          }
        }}
        onStartOver={() => {
          writeSwipedProductIds([]);
          setSwipedProductIds([]);
          setCurrentIndex(0);
        }}
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
        productsError={productsError}
        recentlyViewedProducts={recentlyViewedProducts}
        showAnimation={showAnimation}
        swipeDirection={swipeDirection}
      />
    </div>
  );
};
