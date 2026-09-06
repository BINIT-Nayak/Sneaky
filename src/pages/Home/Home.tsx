import type { TouchEvent } from "react";
import { useRef, useEffect, useState, useContext, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { FloatingParticles } from "../../components/FloatingParticles/FloatingParticles";
import { Toast } from "../../components/Toast/Toast";
import { AuthContext } from "../../context/AuthContext";
import { useIsMobile, useIsTablet } from "../../hooks/useGetDeviceType";
import { eventApi } from "../../services/eventAPI";
import { fetchProducts } from "../../store/fetchAPI/fetchProducts";
import { useSneakyStateSlice } from "../../store/sneakyState/sneakySelectors";
import { sneakyStateActions } from "../../store/sneakyState/sneakySlice";
import type { AppDispatch } from "../../store/sneakyStore";
import type { Product } from "../../store/types";
import { isAdminRole } from "../../utils/roles";

import styles from "./Home.module.css";
import { HomeContent } from "./HomeContent";
import type { ToastMessage } from "./useHomeActions";
import { useHomeActions } from "./useHomeActions";

const RECENTLY_VIEWED_STORAGE_KEY = "sneaky:recently-viewed-products";
const SWIPED_PRODUCTS_STORAGE_KEY = "sneaky:home-swiped-product-ids";
const HOME_PRODUCTS_CACHE_KEY = "sneaky:home-products-cache";
const RECENTLY_VIEWED_STORAGE_LIMIT = 3;
const RECENTLY_VIEWED_VISIBLE_LIMIT = 2;
const RECOMMENDATION_PREFETCH_THRESHOLD = 10;
const SWIPED_PRODUCTS_STORAGE_LIMIT = 60;
const EXCLUDE_IDS_QUERY_LIMIT = 60;
const HOME_PRODUCTS_CACHE_LIMIT = 30;
const HOME_PRODUCTS_CACHE_TTL_MS = 30 * 60 * 1000;

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

const writeStoredIds = (storage: Storage, key: string, ids: string[]) => {
  try {
    storage.setItem(key, JSON.stringify(ids));
  } catch {
    // Browser storage can be unavailable in private browsing or test contexts.
  }
};

const readCachedHomeProducts = (): Product[] => {
  try {
    const storedValue = window.localStorage.getItem(HOME_PRODUCTS_CACHE_KEY);
    if (!storedValue) return [];

    const payload = JSON.parse(storedValue) as {
      products?: Product[];
      savedAt?: number;
    };

    if (
      typeof payload.savedAt !== "number" ||
      Date.now() - payload.savedAt > HOME_PRODUCTS_CACHE_TTL_MS ||
      !Array.isArray(payload.products)
    ) {
      return [];
    }

    return payload.products.filter(
      (product): product is Product =>
        typeof product?.id === "string" &&
        typeof product.name === "string" &&
        typeof product.image === "string",
    );
  } catch {
    return [];
  }
};

const writeCachedHomeProducts = (products: Product[]) => {
  try {
    window.localStorage.setItem(
      HOME_PRODUCTS_CACHE_KEY,
      JSON.stringify({
        products: products.slice(0, HOME_PRODUCTS_CACHE_LIMIT),
        savedAt: Date.now(),
      }),
    );
  } catch {
    // Product cache is an optimization only.
  }
};

const uniqueIds = (ids: string[]) => Array.from(new Set(ids));
const toRecommendationExcludeIds = (ids: string[]) =>
  uniqueIds(ids).slice(0, EXCLUDE_IDS_QUERY_LIMIT);

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
    readStoredIds(
      window.localStorage,
      RECENTLY_VIEWED_STORAGE_KEY,
      RECENTLY_VIEWED_STORAGE_LIMIT,
    ),
  );
  const [swipedProductIds, setSwipedProductIds] = useState<string[]>(() =>
    readStoredIds(
      window.sessionStorage,
      SWIPED_PRODUCTS_STORAGE_KEY,
      SWIPED_PRODUCTS_STORAGE_LIMIT,
    ),
  );
  const [lastProductsError, setLastProductsError] = useState<string | null>(
    null,
  );
  const cardRef = useRef<HTMLDivElement>(null);
  const hasRequestedInitialProductsRef = useRef(false);
  const lastPrefetchRemainingRef = useRef<number | null>(null);
  const trackedImpressionIdsRef = useRef<Set<string>>(new Set());
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const isAdmin = isAdminRole(user?.role);
  const excludedProductIds = useMemo(
    () =>
      toRecommendationExcludeIds([
        ...products.map((product) => product.id),
        ...swipedProductIds,
      ]),
    [products, swipedProductIds],
  );
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
    onProductAdvanceStart: () => setIsDetailsOpen(false),
    onProductSwiped: (product) => {
      setSwipedProductIds((previousIds) => {
        const nextIds = previousIds.includes(product.id)
          ? previousIds
          : [product.id, ...previousIds].slice(0, SWIPED_PRODUCTS_STORAGE_LIMIT);

        writeStoredIds(
          window.sessionStorage,
          SWIPED_PRODUCTS_STORAGE_KEY,
          nextIds,
        );
        return nextIds;
      });
    },
    setCurrentIndex,
    setShowAnimation,
    setShowToast,
    setSwipeDirection,
    showAnimation,
  });

  // Hover glow uses cached geometry and batches CSS variable writes per frame.
  useEffect(() => {
    if (isMobile || isTablet || !currentProduct) return;

    const card = cardRef.current;
    if (!card) return;

    let frameId = 0;
    let latestX = 50;
    let latestY = 50;
    let rect = card.getBoundingClientRect();

    const updateGlow = () => {
      frameId = 0;
      card.style.setProperty("--mouse-x", `${latestX}%`);
      card.style.setProperty("--mouse-y", `${latestY}%`);
    };

    const updateRect = () => {
      rect = card.getBoundingClientRect();
    };

    const handleMouseMove = (event: MouseEvent) => {
      latestX = ((event.clientX - rect.left) / rect.width) * 100;
      latestY = ((event.clientY - rect.top) / rect.height) * 100;

      if (!frameId) {
        frameId = requestAnimationFrame(updateGlow);
      }
    };

    card.addEventListener("mouseenter", updateRect);
    card.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", updateRect, { passive: true });

    return () => {
      card.removeEventListener("mouseenter", updateRect);
      card.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", updateRect);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [currentProduct, isMobile, isTablet]);

  // Fetch products on mount
  useEffect(() => {
    if (
      hasRequestedInitialProductsRef.current ||
      products.length > 0 ||
      productsLoading ||
      productsError
    )
      return;

    hasRequestedInitialProductsRef.current = true;
    const cachedProducts = readCachedHomeProducts();

    if (cachedProducts.length > 0) {
      dispatch(sneakyStateActions.hydrateProductsFromCache(cachedProducts));
    }

    const excludeProductIds = toRecommendationExcludeIds(swipedProductIds);

    dispatch(
      fetchProducts(
        cachedProducts.length > 0 || excludeProductIds.length > 0
          ? {
              ...(excludeProductIds.length > 0 ? { excludeProductIds } : {}),
              ...(cachedProducts.length > 0 ? { forceRefresh: true } : {}),
            }
          : undefined,
      ),
    );
  }, [
    dispatch,
    products.length,
    productsError,
    productsLoading,
    swipedProductIds,
  ]);

  useEffect(() => {
    if (products.length === 0) return;

    writeCachedHomeProducts(products);
  }, [products]);

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
        excludeProductIds: excludedProductIds,
      }),
    );
  }, [
    currentIndex,
    dispatch,
    excludedProductIds,
    feedProducts.length,
    products.length,
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

      writeStoredIds(window.localStorage, RECENTLY_VIEWED_STORAGE_KEY, nextIds);
      return nextIds;
    });
  }, [currentProduct]);

  useEffect(() => {
    if (!isLoggedIn || !currentProduct) return;

    const impressionKey = `${currentProduct.id}:${currentIndex}`;
    if (trackedImpressionIdsRef.current.has(impressionKey)) return;

    trackedImpressionIdsRef.current.add(impressionKey);
    void eventApi
      .track({
        productId: currentProduct.id,
        type: "IMPRESSION",
        source: "DISCOVERY_FEED",
        position: currentIndex,
      })
      .catch(() => {
        // Event tracking should not block product browsing.
      });
  }, [currentIndex, currentProduct, isLoggedIn]);

  useEffect(() => {
    if (!productsError || productsError === lastProductsError) return;

    setShowToast({ id: Date.now(), message: productsError });
    setLastProductsError(productsError);
    const timer = window.setTimeout(() => setShowToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [lastProductsError, productsError]);

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
          cursorAttraction={!isMobile}
          attractionRadius={0.45}
          damping={0.94}
          size={50}
          speed={0.0005}
          strength={0.01}
          velocityBias={0.8}
        />
      ) : null}

      <Toast key={showToast?.id} message={showToast?.message} />
      <HomeContent
        cardRef={cardRef}
        currentProduct={currentProduct}
        isAdmin={isAdmin}
        isFinished={isFinished}
        isLoading={productsLoading && !currentProduct}
        isDetailsOpen={isDetailsOpen}
        onAddToCart={onAddToCart}
        onCloseDetails={() => setIsDetailsOpen(false)}
        onDislike={onDislike}
        onEditProduct={(productId) => {
          navigate("/admin", { state: { editProductId: productId } });
        }}
        onLike={onLike}
        onOpenDetails={() => {
          setIsDetailsOpen(true);
          if (!isLoggedIn || !currentProduct) return;

          void eventApi
            .track({
              productId: currentProduct.id,
              type: "CLICK",
              source: "DISCOVERY_FEED",
              position: currentIndex,
              metadata: {
                target: "DETAILS_BUTTON",
              },
            })
            .catch(() => {
              // Product details should open even if event tracking fails.
            });

          void eventApi
            .track({
              productId: currentProduct.id,
              type: "VIEW",
              source: "DISCOVERY_FEED",
              position: currentIndex,
              metadata: {
                interaction: "DETAILS_OPENED",
              },
            })
            .catch(() => {
              // Product details should open even if event tracking fails.
            });
        }}
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
          writeStoredIds(window.sessionStorage, SWIPED_PRODUCTS_STORAGE_KEY, []);
          setSwipedProductIds([]);
          setCurrentIndex(0);
        }}
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
        productsError={currentProduct ? null : productsError}
        recentlyViewedProducts={recentlyViewedProducts}
        showAnimation={showAnimation}
        swipeDirection={swipeDirection}
      />
    </div>
  );
};
