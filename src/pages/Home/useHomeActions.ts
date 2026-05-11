import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import { addCartItem } from "../../store/fetchAPI/addCartItem";
import { addWishlistItem } from "../../store/fetchAPI/addWishlistItem";
import type { AppDispatch } from "../../store/sneakyStore";
import type { Product } from "../../store/types";

type SwipeDirection = "left" | "right" | null;
export type ToastMessage = {
  id: number;
  message: string;
};

type UseHomeActionsParams = {
  currentProduct: Product | undefined;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
  setShowAnimation: Dispatch<SetStateAction<boolean>>;
  setShowToast: Dispatch<SetStateAction<ToastMessage | null>>;
  setSwipeDirection: Dispatch<SetStateAction<SwipeDirection>>;
  showAnimation: boolean;
};

const SWIPE_ANIMATION_DURATION = 300;

export const useHomeActions = ({
  currentProduct,
  isLoggedIn,
  onOpenAuth,
  setCurrentIndex,
  setShowAnimation,
  setShowToast,
  setSwipeDirection,
  showAnimation,
}: UseHomeActionsParams) => {
  const dispatch = useDispatch<AppDispatch>();
  const [wishlistSubmitting, setWishlistSubmitting] = useState(false);
  const [cartSubmitting, setCartSubmitting] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastIdRef = useRef(0);

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const showToastMessage = useCallback(
    (message: string) => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }

      toastIdRef.current += 1;
      setShowToast({ id: toastIdRef.current, message });
      toastTimerRef.current = setTimeout(() => {
        setShowToast(null);
        toastTimerRef.current = null;
      }, 2000);
    },
    [setShowToast],
  );

  const advanceProduct = useCallback(
    (direction: Exclude<SwipeDirection, null>) => {
      setSwipeDirection(direction);
      setShowAnimation(true);

      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setShowAnimation(false);
        setSwipeDirection(null);
      }, SWIPE_ANIMATION_DURATION);
    },
    [setCurrentIndex, setShowAnimation, setSwipeDirection],
  );

  const onLike = useCallback(() => {
    if (showAnimation || wishlistSubmitting) return;

    if (!isLoggedIn) {
      onOpenAuth();
      showToastMessage("🔐 Please sign in to add to wishlist");
      return;
    }

    if (currentProduct) {
      setWishlistSubmitting(true);
      void dispatch(addWishlistItem({ productId: currentProduct.id }))
        .unwrap()
        .then(() => {
          advanceProduct("right");
          showToastMessage(`❤️ Added ${currentProduct.name} to wishlist!`);
        })
        .catch((err) => {
          const message =
            typeof err === "string"
              ? err
              : err instanceof Error
                ? err.message
                : "Failed to add to wishlist";
          showToastMessage(message);
        })
        .finally(() => {
          setWishlistSubmitting(false);
        });
    }
  }, [
    advanceProduct,
    currentProduct,
    dispatch,
    isLoggedIn,
    onOpenAuth,
    showAnimation,
    showToastMessage,
    wishlistSubmitting,
  ]);

  const onDislike = useCallback(() => {
    if (showAnimation || !currentProduct) return;

    advanceProduct("left");
  }, [advanceProduct, currentProduct, showAnimation]);

  const onAddToCart = useCallback(() => {
    if (showAnimation || cartSubmitting) return;

    if (!isLoggedIn) {
      onOpenAuth();
      showToastMessage("🔐 Please sign in to add to cart");
      return;
    }

    if (currentProduct) {
      setCartSubmitting(true);
      void dispatch(addCartItem({ productId: currentProduct.id }))
        .unwrap()
        .then(() => {
          advanceProduct("right");
          showToastMessage(`🛒 Added ${currentProduct.name} to cart!`);
        })
        .catch((err) => {
          const message =
            typeof err === "string"
              ? err
              : err instanceof Error
                ? err.message
                : "Failed to add to cart";
          showToastMessage(message);
        })
        .finally(() => {
          setCartSubmitting(false);
        });
    }
  }, [
    advanceProduct,
    cartSubmitting,
    currentProduct,
    dispatch,
    isLoggedIn,
    onOpenAuth,
    showAnimation,
    showToastMessage,
  ]);

  return {
    onAddToCart,
    onDislike,
    onLike,
  };
};
