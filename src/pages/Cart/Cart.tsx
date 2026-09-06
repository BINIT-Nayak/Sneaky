import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import {
  FiExternalLink,
  FiHeart,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiShoppingCart,
  FiTrash2,
} from "../../components/Icon/Icon";

import emptyCart from "../../assets/emptyList.avif";
import { Toast } from "../../components/Toast/Toast";
import { AuthContext } from "../../context/AuthContext";
import { eventApi } from "../../services/eventAPI";
import { clearCartItems } from "../../store/fetchAPI/clearCartItems";
import { deleteCartItem } from "../../store/fetchAPI/deleteCartItem";
import { fetchCart } from "../../store/fetchAPI/fetchCart";
import { moveCartItemToWishlist } from "../../store/fetchAPI/moveCartItemToWishlist";
import { updateCartQuantity } from "../../store/fetchAPI/updateCartQuantity";
import { useSneakyStateSlice } from "../../store/sneakyState/sneakySelectors";
import { sneakyStateActions } from "../../store/sneakyState/sneakySlice";
import type { AppDispatch } from "../../store/sneakyStore";
import type { ICartItem } from "../../store/types";
import {
  getOptimizedImageUrl,
  getResponsiveImageSrcSet,
} from "../../utils/imageUrl";
import {
  getSneakerDetails,
  UNIQUE_PRODUCT_MESSAGE,
} from "../../utils/productDetails";

import styles from "./Cart.module.css";

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

const CART_SKELETON_ITEMS = 4;
const CART_CACHE_TTL_MS = 10 * 60 * 1000;
const CART_BACKGROUND_REFRESH_DELAY_MS = 2500;
const DELIVERY_FEE = 199;
const FREE_DELIVERY_THRESHOLD = 10000;
const SNEAKY_DISCOUNT_THRESHOLD = 20000;
const SNEAKY_DISCOUNT_RATE = 0.1;

const DEFAULT_MERCHANT_NAME = "Partner Store";
const getCartCacheKey = (userId: string) => `sneaky:cart-cache:${userId}`;

const isCartItem = (item: ICartItem | null | undefined) =>
  typeof item?.productId === "string" &&
  typeof item.name === "string" &&
  typeof item.imageUrl === "string" &&
  typeof item.brandName === "string" &&
  typeof item.price === "number" &&
  typeof item.quantity === "number" &&
  typeof item.itemTotal === "number";

const readCachedCart = (userId: string): ICartItem[] => {
  try {
    const storedValue = window.localStorage.getItem(getCartCacheKey(userId));
    if (!storedValue) return [];

    const payload = JSON.parse(storedValue) as {
      items?: ICartItem[];
      savedAt?: number;
    };

    if (
      typeof payload.savedAt !== "number" ||
      Date.now() - payload.savedAt > CART_CACHE_TTL_MS ||
      !Array.isArray(payload.items)
    ) {
      return [];
    }

    return payload.items.filter(isCartItem);
  } catch {
    return [];
  }
};

const writeCachedCart = (userId: string, items: ICartItem[]) => {
  try {
    window.localStorage.setItem(
      getCartCacheKey(userId),
      JSON.stringify({
        items,
        savedAt: Date.now(),
      }),
    );
  } catch {
    // Cart cache is only used to improve reload paint.
  }
};

const scheduleCartRefresh = (callback: () => void) => {
  const idleWindow = window as WindowWithIdleCallback;

  if (idleWindow.requestIdleCallback) {
    const idleHandle = idleWindow.requestIdleCallback(callback, {
      timeout: CART_BACKGROUND_REFRESH_DELAY_MS,
    });

    return () => {
      idleWindow.cancelIdleCallback?.(idleHandle);
    };
  }

  const timeoutId = window.setTimeout(
    callback,
    CART_BACKGROUND_REFRESH_DELAY_MS,
  );

  return () => {
    window.clearTimeout(timeoutId);
  };
};

export const Cart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthReady, isLoggedIn, onOpenAuth, user } = useContext(AuthContext);
  const [submittingProductId, setSubmittingProductId] = useState<string | null>(
    null,
  );
  const [isClearing, setIsClearing] = useState(false);
  const [cartActionError, setCartActionError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<ToastMessage | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastIdRef = useRef(0);
  const hasRequestedCartRef = useRef(false);

  const cart = useSneakyStateSlice.getCart();
  const cartLoading = useSneakyStateSlice.getCartLoading();
  const cartStatus = useSneakyStateSlice.getCartStatus();
  const cartError = useSneakyStateSlice.getCartError();
  const isCartLoading = cartLoading || cartStatus === "idle";
  const shouldShowInitialCartLoading = isCartLoading && cart.length === 0;

  useEffect(() => {
    if (!isLoggedIn || !user?.userId || cartStatus !== "idle") return;

    const cachedCart = readCachedCart(user.userId);
    if (cachedCart.length > 0) {
      dispatch(sneakyStateActions.hydrateCartFromCache(cachedCart));
      hasRequestedCartRef.current = true;
      return scheduleCartRefresh(() => {
        void dispatch(fetchCart({ forceRefresh: true }));
      });
    }
  }, [cartStatus, dispatch, isLoggedIn, user?.userId]);

  useEffect(() => {
    if (
      !isAuthReady ||
      !isLoggedIn ||
      cartStatus !== "idle" ||
      hasRequestedCartRef.current
    )
      return;

    hasRequestedCartRef.current = true;
    void dispatch(fetchCart());
  }, [cartStatus, dispatch, isAuthReady, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !user?.userId || cartStatus !== "succeeded") return;

    writeCachedCart(user.userId, cart);
  }, [cart, cartStatus, isLoggedIn, user?.userId]);

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const showToastMessage = useCallback((message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastIdRef.current += 1;
    setShowToast({ id: toastIdRef.current, message });
    toastTimerRef.current = setTimeout(() => {
      setShowToast(null);
      toastTimerRef.current = null;
    }, 3000);
  }, []);

  const itemCount = useMemo(
    () => cart.reduce((count, item) => count + item.quantity, 0),
    [cart],
  );
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.itemTotal, 0),
    [cart],
  );
  const deliveryFee = total >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const discount =
    total >= SNEAKY_DISCOUNT_THRESHOLD
      ? Math.round(total * SNEAKY_DISCOUNT_RATE)
      : 0;
  const finalTotal = Math.max(total + deliveryFee - discount, 0);
  const merchantGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        itemCount: number;
        merchantName: string;
        merchantUrl?: string;
        productIds: string[];
        total: number;
      }
    >();

    cart.forEach((item) => {
      const merchantName = item.merchantName || DEFAULT_MERCHANT_NAME;
      const existingGroup = groups.get(merchantName);

      if (existingGroup) {
        existingGroup.itemCount += item.quantity;
        existingGroup.productIds.push(item.productId);
        existingGroup.total += item.itemTotal;
        existingGroup.merchantUrl =
          existingGroup.merchantUrl || item.merchantUrl;
        return;
      }

      groups.set(merchantName, {
        itemCount: item.quantity,
        merchantName,
        merchantUrl: item.merchantUrl,
        productIds: [item.productId],
        total: item.itemTotal,
      });
    });

    return Array.from(groups.values()).sort((first, second) =>
      first.merchantName.localeCompare(second.merchantName),
    );
  }, [cart]);

  const getActionErrorMessage = (err: unknown, fallback: string) =>
    typeof err === "string"
      ? err
      : err instanceof Error
        ? err.message
        : fallback;

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number,
  ) => {
    if (submittingProductId || isClearing) return;

    setSubmittingProductId(productId);
    setCartActionError(null);

    try {
      if (newQuantity < 1) {
        await dispatch(deleteCartItem(productId)).unwrap();
        showToastMessage("Removed from cart.");
      } else {
        await dispatch(
          updateCartQuantity({ productId, quantity: newQuantity }),
        ).unwrap();
        showToastMessage("Cart quantity updated.");
      }
    } catch (err) {
      setCartActionError(
        getActionErrorMessage(err, "We couldn't update your cart."),
      );
    } finally {
      setSubmittingProductId(null);
    }
  };

  const handleRemove = async (productId: string) => {
    if (submittingProductId || isClearing) return;

    setSubmittingProductId(productId);
    setCartActionError(null);

    try {
      await dispatch(deleteCartItem(productId)).unwrap();
      showToastMessage("Removed from cart.");
    } catch (err) {
      setCartActionError(
        getActionErrorMessage(err, "We couldn't remove this item."),
      );
    } finally {
      setSubmittingProductId(null);
    }
  };

  const handleMoveToWishlist = async (
    productId: string,
    productName: string,
  ) => {
    if (submittingProductId || isClearing) return;

    setSubmittingProductId(productId);
    setCartActionError(null);

    try {
      await dispatch(moveCartItemToWishlist(productId)).unwrap();
      showToastMessage(`${productName} moved to wishlist.`);
    } catch (err) {
      setCartActionError(
        getActionErrorMessage(err, "We couldn't move this item to wishlist."),
      );
    } finally {
      setSubmittingProductId(null);
    }
  };

  const handleClearCart = async () => {
    if (isClearing) return;

    setIsClearing(true);
    setCartActionError(null);

    try {
      await dispatch(clearCartItems()).unwrap();
      showToastMessage("Cart cleared.");
    } catch (err) {
      setCartActionError(
        getActionErrorMessage(err, "We couldn't clear your cart."),
      );
    } finally {
      setIsClearing(false);
    }
  };

  const checkoutWithMerchant = (
    merchantName: string,
    merchantUrl: string | undefined,
    productIds: string[],
  ) => {
    if (!merchantUrl) {
      setCartActionError(`No checkout link is available for ${merchantName}.`);
      return;
    }

    productIds.forEach((productId, position) => {
      void eventApi
        .track({
          productId,
          type: "PURCHASE",
          source: "CART_CHECKOUT",
          position,
          metadata: {
            merchantName,
            checkoutType: "EXTERNAL_INTENT",
          },
        })
        .catch(() => {
          // Checkout should not wait for event tracking.
        });
    });

    window.open(merchantUrl, "_blank", "noopener,noreferrer");
  };

  if (!isLoggedIn) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.cartEmpty}>
          <img
            className={styles.cart__icon}
            src={emptyCart}
            alt=""
            aria-hidden="true"
          />
          <FiShoppingCart
            className={styles.cart__emptySymbol}
            aria-hidden="true"
          />
          <h2 className={styles.cart__emptyTitle}>Your cart is waiting</h2>
          <p className={styles.cart__message}>
            Please log in to view your cart and keep your sneaker picks synced.
          </p>
          <button className={styles.cart__loginBtn} onClick={onOpenAuth}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (shouldShowInitialCartLoading) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.cart} aria-label="Loading cart">
          <div
            className={`${styles.cart__skeleton} ${styles.cart__titleSkeleton}`}
          />
          <p className={styles.cart__loadingStatus}>Loading cart...</p>
          <div className={styles.cart__content}>
            <div className={styles.cart__items}>
              {Array.from({ length: CART_SKELETON_ITEMS }, (_, index) => (
                <div key={index} className={styles.cart__item}>
                  <div
                    className={`${styles.cart__skeleton} ${styles.cart__imageSkeleton}`}
                  />
                  <div className={styles.cart__itemDetails}>
                    <div
                      className={`${styles.cart__skeleton} ${styles.cart__lineSkeleton}`}
                    />
                    <div
                      className={`${styles.cart__skeleton} ${styles.cart__lineSkeletonShort}`}
                    />
                    <div
                      className={`${styles.cart__skeleton} ${styles.cart__priceSkeleton}`}
                    />
                  </div>
                  <div
                    className={`${styles.cart__skeleton} ${styles.cart__quantitySkeleton}`}
                  />
                  <div
                    className={`${styles.cart__skeleton} ${styles.cart__totalSkeleton}`}
                  />
                </div>
              ))}
            </div>

            <div className={styles.cart__summary}>
              <div
                className={`${styles.cart__skeleton} ${styles.cart__summaryTitleSkeleton}`}
              />
              <div
                className={`${styles.cart__skeleton} ${styles.cart__summaryLineSkeleton}`}
              />
              <div
                className={`${styles.cart__skeleton} ${styles.cart__summaryLineSkeleton}`}
              />
              <div className={styles.cart__summaryDivider} />
              <div
                className={`${styles.cart__skeleton} ${styles.cart__summaryTotalSkeleton}`}
              />
              <div
                className={`${styles.cart__skeleton} ${styles.cart__buttonSkeleton}`}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.cartEmpty}>
          <img
            className={styles.cart__icon}
            src={emptyCart}
            alt=""
            aria-hidden="true"
          />
          <FiShoppingCart
            className={styles.cart__emptySymbol}
            aria-hidden="true"
          />
          <h2 className={styles.cart__emptyTitle}>Cart could not load</h2>
          <p className={styles.cart__message}>{cartError}</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.cartEmpty}>
          <img
            className={styles.cart__icon}
            src={emptyCart}
            alt=""
            aria-hidden="true"
          />
          <FiShoppingCart
            className={styles.cart__emptySymbol}
            aria-hidden="true"
          />
          <h2 className={styles.cart__emptyTitle}>Your cart is empty</h2>
          <p className={styles.cart__message}>
            Add a pair when one feels checkout-worthy.
          </p>
          <Link
            className={styles.cart__browseBtn}
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
    <div className={styles.cartContainer}>
      <div className={styles.cart}>
        <Toast key={showToast?.id} message={showToast?.message} />

        <h2 className={styles.cart__title}>
          <FiShoppingBag /> My Cart ({itemCount} items)
        </h2>
        {cartActionError ? (
          <div className={styles.cart__error}>{cartActionError}</div>
        ) : null}

        <div className={styles.cart__content}>
          <div className={styles.cart__items}>
            {cart.map((item, index) => {
              const sneakerDetails = getSneakerDetails(item);
              const isItemSubmitting = submittingProductId === item.productId;
              const areItemActionsDisabled = isItemSubmitting || isClearing;

              return (
                <div key={item.productId} className={styles.cart__item}>
                  <img
                    src={getOptimizedImageUrl(item.imageUrl, {
                      quality: 62,
                      width: 180,
                    })}
                    srcSet={getResponsiveImageSrcSet(
                      item.imageUrl,
                      [120, 180, 240],
                      62,
                    )}
                    sizes="92px"
                    alt={item.name}
                    className={styles.cart__itemImage}
                    decoding="async"
                    {...{ fetchpriority: index === 0 ? "high" : "auto" }}
                    height={92}
                    loading={index < 3 ? "eager" : "lazy"}
                    width={92}
                  />
                  <div className={styles.cart__itemDetails}>
                    <h3 className={styles.cart__itemTitle}>{item.name}</h3>
                    {item.category ? (
                      <p className={styles.cart__itemCategory}>
                        {item.category}
                      </p>
                    ) : null}
                    <p className={styles.cart__itemMerchant}>
                      {item.merchantName || DEFAULT_MERCHANT_NAME}
                    </p>
                    <p className={styles.cart__itemBrand}>{item.brandName}</p>
                    <p className={styles.cart__itemPrice}>
                      ₹{item.price.toLocaleString()}
                    </p>
                    <div className={styles.cart__itemMeta}>
                      {sneakerDetails.stockStatus ? (
                        <span>{sneakerDetails.stockStatus}</span>
                      ) : null}
                      {sneakerDetails.isUnique ? (
                        <span>{UNIQUE_PRODUCT_MESSAGE}</span>
                      ) : (
                        <>
                          <span>{sneakerDetails.sizes.join(", ")}</span>
                          <span>
                            Colors:{" "}
                            {sneakerDetails.colors
                              .map((color) => color.name)
                              .join(", ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles.cart__itemActions}>
                    <div className={styles.cart__quantity}>
                      <button
                        className={styles.cart__quantityBtn}
                        disabled={areItemActionsDisabled || item.quantity <= 1}
                        aria-label={`Decrease ${item.name} quantity`}
                        onClick={() => {
                          void handleUpdateQuantity(
                            item.productId,
                            item.quantity - 1,
                          );
                        }}
                      >
                        <FiMinus />
                      </button>
                      <span className={styles.cart__quantityValue}>
                        {item.quantity}
                      </span>
                      <button
                        className={styles.cart__quantityBtn}
                        disabled={areItemActionsDisabled}
                        aria-label={`Increase ${item.name} quantity`}
                        onClick={() => {
                          void handleUpdateQuantity(
                            item.productId,
                            item.quantity + 1,
                          );
                        }}
                      >
                        <FiPlus />
                      </button>
                    </div>
                    <button
                      className={styles.cart__wishlistBtn}
                      disabled={areItemActionsDisabled}
                      aria-label={`Move ${item.name} to wishlist`}
                      onClick={() => {
                        void handleMoveToWishlist(item.productId, item.name);
                      }}
                      type="button"
                    >
                      <FiHeart />
                    </button>
                    <button
                      className={styles.cart__removeBtn}
                      disabled={areItemActionsDisabled}
                      aria-label={`Remove ${item.name}`}
                      onClick={() => {
                        void handleRemove(item.productId);
                      }}
                      type="button"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  <div className={styles.cart__itemTotal}>
                    ₹{item.itemTotal.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.cart__summary}>
            <h3 className={styles.cart__summaryTitle}>Store Checkout</h3>
            <div className={styles.cart__summaryRow}>
              <span>Subtotal ({itemCount} items)</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <div className={styles.cart__summaryRow}>
              <span>Delivery</span>
              <span>
                {deliveryFee === 0
                  ? "Free"
                  : `₹${deliveryFee.toLocaleString()}`}
              </span>
            </div>
            <div className={styles.cart__summaryRow}>
              <span>Sneaky discount</span>
              <span>
                {discount > 0 ? `-₹${discount.toLocaleString()}` : "₹0"}
              </span>
            </div>
            <div className={styles.cart__summaryNote}>
              Free delivery above ₹{FREE_DELIVERY_THRESHOLD.toLocaleString()}.
              10% Sneaky discount above ₹
              {SNEAKY_DISCOUNT_THRESHOLD.toLocaleString()}.
            </div>
            <div className={styles.cart__summaryDivider} />
            <div
              className={`${styles.cart__summaryRow} ${styles.cart__summaryTotal}`}
            >
              <span>Total</span>
              <span>₹{finalTotal.toLocaleString()}</span>
            </div>
            <div className={styles.cart__merchantActions}>
              {merchantGroups.map((group) => (
                <button
                  className={styles.cart__checkoutBtn}
                  key={group.merchantName}
                  onClick={() => {
                    checkoutWithMerchant(
                      group.merchantName,
                      group.merchantUrl,
                      group.productIds,
                    );
                  }}
                  type="button"
                >
                  <span>
                    <FiExternalLink /> Continue on {group.merchantName}
                  </span>
                  <small>
                    {group.itemCount} {group.itemCount === 1 ? "item" : "items"}{" "}
                    · ₹{group.total.toLocaleString()}
                  </small>
                </button>
              ))}
            </div>
            <button
              className={styles.cart__clearBtn}
              disabled={isClearing}
              onClick={() => {
                void handleClearCart();
              }}
            >
              {isClearing ? "Clearing..." : "Clear Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
