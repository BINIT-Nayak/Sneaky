import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import { FiHeart, FiShoppingBag, FiTrash2 } from "../../components/Icon/Icon";

import bellIcon from "../../assets/bell.avif";
import emptyList from "../../assets/emptyList.avif";
import { Toast } from "../../components/Toast/Toast";
import { AuthContext } from "../../context/AuthContext";
import { clearWishlistItems } from "../../store/fetchAPI/clearWishlistItems";
import { deleteWishlistItem } from "../../store/fetchAPI/deleteWishlistItem";
import { fetchWishlist } from "../../store/fetchAPI/fetchWishlist";
import { moveWishlistItemToCart } from "../../store/fetchAPI/moveWishlistItemToCart";
import { useSneakyStateSlice } from "../../store/sneakyState/sneakySelectors";
import { sneakyStateActions } from "../../store/sneakyState/sneakySlice";
import type { AppDispatch } from "../../store/sneakyStore";
import type { IWishlistItem } from "../../store/types";
import {
  getOptimizedImageUrl,
  getResponsiveImageSrcSet,
} from "../../utils/imageUrl";
import {
  getSneakerDetails,
  UNIQUE_PRODUCT_MESSAGE,
} from "../../utils/productDetails";

import styles from "./Wishlist.module.css";

const mapWishlistItem = (item: IWishlistItem) => ({
  details: getSneakerDetails(item),
  id: item.productId,
  name: item.name,
  brand: item.brandName,
  category: item.category,
  price: item.price,
  image: item.imageUrl,
});

const WISHLIST_SKELETON_ITEMS = 6;
const WISHLIST_CACHE_TTL_MS = 10 * 60 * 1000;
const WISHLIST_BACKGROUND_REFRESH_DELAY_MS = 2500;
const getWishlistCacheKey = (userId: string) => `sneaky:wishlist-cache:${userId}`;

type ToastMessage = {
  id: number;
  message: string;
};

type WindowWithIdleCallback = Window & {
  cancelIdleCallback?: (handle: number) => void;
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
};

const isWishlistItem = (item: IWishlistItem | null | undefined) =>
  typeof item?.productId === "string" &&
  typeof item.name === "string" &&
  typeof item.imageUrl === "string" &&
  typeof item.brandName === "string" &&
  typeof item.price === "number";

const readCachedWishlist = (userId: string): IWishlistItem[] => {
  try {
    const storedValue = window.localStorage.getItem(getWishlistCacheKey(userId));
    if (!storedValue) return [];

    const payload = JSON.parse(storedValue) as {
      items?: IWishlistItem[];
      savedAt?: number;
    };

    if (
      typeof payload.savedAt !== "number" ||
      Date.now() - payload.savedAt > WISHLIST_CACHE_TTL_MS ||
      !Array.isArray(payload.items)
    ) {
      return [];
    }

    return payload.items.filter(isWishlistItem);
  } catch {
    return [];
  }
};

const writeCachedWishlist = (userId: string, items: IWishlistItem[]) => {
  try {
    window.localStorage.setItem(
      getWishlistCacheKey(userId),
      JSON.stringify({
        items,
        savedAt: Date.now(),
      }),
    );
  } catch {
    // Wishlist cache is only used to improve reload paint.
  }
};

const scheduleWishlistRefresh = (callback: () => void) => {
  const idleWindow = window as WindowWithIdleCallback;

  if (idleWindow.requestIdleCallback) {
    const idleHandle = idleWindow.requestIdleCallback(callback, {
      timeout: WISHLIST_BACKGROUND_REFRESH_DELAY_MS,
    });

    return () => {
      idleWindow.cancelIdleCallback?.(idleHandle);
    };
  }

  const timeoutId = window.setTimeout(
    callback,
    WISHLIST_BACKGROUND_REFRESH_DELAY_MS,
  );

  return () => {
    window.clearTimeout(timeoutId);
  };
};

export const Wishlist = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthReady, isLoggedIn, onOpenAuth, user } = useContext(AuthContext);
  const [removingProductId, setRemovingProductId] = useState<string | null>(
    null,
  );
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [isClearingWishlist, setIsClearingWishlist] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<ToastMessage | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastIdRef = useRef(0);
  const hasRequestedWishlistRef = useRef(false);

  const wishlistItems = useSneakyStateSlice.getWishlist();
  const wishlistLoading = useSneakyStateSlice.getWishlistLoading();
  const wishlistStatus = useSneakyStateSlice.getWishlistStatus();
  const wishlistError = useSneakyStateSlice.getWishlistError();
  const isWishlistLoading = wishlistLoading || wishlistStatus === "idle";
  const shouldShowInitialWishlistLoading =
    isWishlistLoading && wishlistItems.length === 0;

  useEffect(() => {
    if (!isLoggedIn || !user?.userId || wishlistStatus !== "idle") return;

    const cachedWishlist = readCachedWishlist(user.userId);
    if (cachedWishlist.length > 0) {
      dispatch(sneakyStateActions.hydrateWishlistFromCache(cachedWishlist));
      hasRequestedWishlistRef.current = true;
      return scheduleWishlistRefresh(() => {
        void dispatch(fetchWishlist({ forceRefresh: true }));
      });
    }
  }, [dispatch, isLoggedIn, user?.userId, wishlistStatus]);

  useEffect(() => {
    if (
      !isAuthReady ||
      !isLoggedIn ||
      wishlistStatus !== "idle" ||
      hasRequestedWishlistRef.current
    )
      return;

    hasRequestedWishlistRef.current = true;
    void dispatch(fetchWishlist());
  }, [dispatch, isAuthReady, isLoggedIn, wishlistStatus]);

  useEffect(() => {
    if (!isLoggedIn || !user?.userId || wishlistStatus !== "succeeded") return;

    writeCachedWishlist(user.userId, wishlistItems);
  }, [isLoggedIn, user?.userId, wishlistItems, wishlistStatus]);

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const mappedItems = wishlistItems.map(mapWishlistItem);

  const showToastMessage = (message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastIdRef.current += 1;
    setShowToast({ id: toastIdRef.current, message });
    toastTimerRef.current = setTimeout(() => {
      setShowToast(null);
      toastTimerRef.current = null;
    }, 3000);
  };

  const getActionErrorMessage = (err: unknown, fallback: string) =>
    typeof err === "string"
      ? err
      : err instanceof Error
        ? err.message
        : fallback;

  const handleAddToCart = async (productId: string, productName: string) => {
    if (addingProductId || removingProductId || isClearingWishlist) return;

    setAddingProductId(productId);
    setDeleteError(null);

    try {
      await dispatch(moveWishlistItemToCart(productId)).unwrap();
      showToastMessage(`${productName} moved to cart.`);
    } catch (err) {
      setDeleteError(
        getActionErrorMessage(
          err,
          "We couldn't move this item to your cart.",
        ),
      );
    } finally {
      setAddingProductId(null);
    }
  };

  const handleDeleteWishlistItem = async (productId: string) => {
    if (removingProductId || addingProductId || isClearingWishlist) return;

    setRemovingProductId(productId);
    setDeleteError(null);

    try {
      await dispatch(deleteWishlistItem(productId)).unwrap();
      showToastMessage("Removed from wishlist.");
    } catch (err) {
      setDeleteError(
        getActionErrorMessage(
          err,
          "We couldn't remove this item from your wishlist. Please try again.",
        ),
      );
    } finally {
      setRemovingProductId(null);
    }
  };

  const handleClearWishlist = async () => {
    if (removingProductId || addingProductId || isClearingWishlist) return;

    setIsClearingWishlist(true);
    setDeleteError(null);

    try {
      await dispatch(clearWishlistItems()).unwrap();
      showToastMessage("Wishlist cleared.");
    } catch (err) {
      setDeleteError(
        getActionErrorMessage(
          err,
          "We couldn't clear your wishlist. Please try again.",
        ),
      );
    } finally {
      setIsClearingWishlist(false);
    }
  };

  // Not logged in - show login prompt
  if (!isLoggedIn) {
    return (
      <div className={styles.wishlistContainer}>
        <div className={styles.wishlist__prompt}>
          <img
            className={styles.wishlist__icon}
            src={emptyList}
            alt=""
            aria-hidden="true"
          />
          <FiHeart
            className={styles.wishlist__emptySymbol}
            aria-hidden="true"
          />
          <h2 className={styles.wishlist__emptyTitle}>
            Your wishlist is waiting
          </h2>
          <p className={styles.wishlist__message}>
            Log in to continue saving the pairs you like.
          </p>
          <button className={styles.wishlist__loginBtn} onClick={onOpenAuth}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (shouldShowInitialWishlistLoading) {
    return (
      <div className={styles.wishlistContainer}>
        <div className={styles.wishlist} aria-label="Loading wishlist">
          <div
            className={`${styles.wishlist__skeleton} ${styles.wishlist__titleSkeleton}`}
          />
          <p className={styles.wishlist__loadingStatus}>
            Loading wishlist...
          </p>
          <div className={styles.wishlist__grid}>
            {Array.from({ length: WISHLIST_SKELETON_ITEMS }, (_, index) => (
              <div key={index} className={styles.wishlist__item}>
                <div
                  className={`${styles.wishlist__skeleton} ${styles.wishlist__imageSkeleton}`}
                />
                <div className={styles.wishlist__itemInfo}>
                  <div
                    className={`${styles.wishlist__skeleton} ${styles.wishlist__lineSkeleton}`}
                  />
                  <div
                    className={`${styles.wishlist__skeleton} ${styles.wishlist__lineSkeletonShort}`}
                  />
                  <div
                    className={`${styles.wishlist__skeleton} ${styles.wishlist__priceSkeleton}`}
                  />
                  <div
                    className={`${styles.wishlist__skeleton} ${styles.wishlist__buttonSkeleton}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (wishlistError) {
    return (
      <div className={styles.wishlistContainer}>
        <div className={styles.wishlist__empty}>
          <img
            className={styles.wishlist__icon}
            src={bellIcon}
            alt=""
            aria-hidden="true"
          />
          <FiHeart
            className={styles.wishlist__emptySymbol}
            aria-hidden="true"
          />
          <h2 className={styles.wishlist__emptyTitle}>
            Wishlist could not load
          </h2>
          <p className={styles.wishlist__message}>{wishlistError}</p>
        </div>
      </div>
    );
  }

  // Logged in but empty wishlist
  if (mappedItems.length === 0) {
    return (
      <div className={styles.wishlistContainer}>
        <div className={styles.wishlist__empty}>
          <img
            className={styles.wishlist__icon}
            src={bellIcon}
            alt=""
            aria-hidden="true"
          />
          <FiHeart
            className={styles.wishlist__emptySymbol}
            aria-hidden="true"
          />
          <h2 className={styles.wishlist__emptyTitle}>Nothing saved yet</h2>
          <p className={styles.wishlist__message}>
            Your wishlist is empty—for now. Start liking products to save them
            here
          </p>
          <Link
            className={styles.wishlist__browseBtn}
            to="/"
            aria-label="Browse products"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wishlistContainer}>
      <div className={styles.wishlist}>
        <Toast key={showToast?.id} message={showToast?.message} />

        <div className={styles.wishlist__header}>
          <h2 className={styles.wishlist__title}>My Wishlist</h2>
          <button
            className={styles.wishlist__clearBtn}
            disabled={
              addingProductId !== null ||
              removingProductId !== null ||
              isClearingWishlist
            }
            type="button"
            onClick={() => void handleClearWishlist()}
          >
            <FiTrash2 />
            {isClearingWishlist ? "Clearing..." : "Clear All"}
          </button>
        </div>
        {deleteError ? (
          <div className={styles.wishlist__deleteError}>{deleteError}</div>
        ) : null}
        <div className={styles.wishlist__grid}>
          {mappedItems.map((item, index) => (
            <div key={item.id} className={styles.wishlist__item}>
              <img
                src={getOptimizedImageUrl(item.image, { quality: 62, width: 360 })}
                srcSet={getResponsiveImageSrcSet(item.image, [240, 320, 420], 62)}
                sizes="(max-width: 768px) calc(100vw - 72px), 320px"
                alt={item.name}
                className={styles.wishlist__itemImage}
                decoding="async"
                {...{ fetchpriority: index === 0 ? "high" : "auto" }}
                height={200}
                loading={index < 2 ? "eager" : "lazy"}
                width={320}
              />
              <div className={styles.wishlist__itemInfo}>
                <h3>{item.name}</h3>
                {item.category ? (
                  <p className={styles.wishlist__category}>{item.category}</p>
                ) : null}
                <p>{item.brand}</p>
                <p className={styles.wishlist__itemPrice}>
                  ₹{item.price.toLocaleString()}
                </p>
                <div className={styles.wishlist__details}>
                  {item.details.stockStatus ? (
                    <span>{item.details.stockStatus}</span>
                  ) : null}
                  {item.details.isUnique ? (
                    <span>{UNIQUE_PRODUCT_MESSAGE}</span>
                  ) : (
                    <>
                      <span>{item.details.sizes.join(", ")}</span>
                      <span>
                        Colors:{" "}
                        {item.details.colors
                          .map((color) => color.name)
                          .join(", ")}
                      </span>
                    </>
                  )}
                </div>
                <div className={styles.wishlist__actions}>
                  <button
                    className={styles.wishlist__cartBtn}
                    disabled={
                      addingProductId !== null ||
                      removingProductId !== null ||
                      isClearingWishlist
                    }
                    type="button"
                    onClick={() => void handleAddToCart(item.id, item.name)}
                  >
                    <FiShoppingBag />
                    {addingProductId === item.id ? "Adding..." : "Add to Cart"}
                  </button>
                  <button
                    className={styles.wishlist__deleteBtn}
                    disabled={
                      addingProductId !== null ||
                      removingProductId !== null ||
                      isClearingWishlist
                    }
                    type="button"
                    aria-label={`Delete ${item.name}`}
                    onClick={() => void handleDeleteWishlistItem(item.id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
