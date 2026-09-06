import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import { addCartItem } from "../../store/fetchAPI/addCartItem";
import { addWishlistItem } from "../../store/fetchAPI/addWishlistItem";
import { recordProductPass } from "../../store/fetchAPI/recordProductPass";
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
  onProductAdvanceStart?: () => void;
  onProductSwiped?: (product: Product) => void;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
  setShowAnimation: Dispatch<SetStateAction<boolean>>;
  setShowToast: Dispatch<SetStateAction<ToastMessage | null>>;
  setSwipeDirection: Dispatch<SetStateAction<SwipeDirection>>;
  showAnimation: boolean;
};

const SWIPE_ANIMATION_DURATION = 420;

export const useHomeActions = ({
  currentProduct,
  isLoggedIn,
  onOpenAuth,
  onProductAdvanceStart,
  onProductSwiped,
  setCurrentIndex,
  setShowAnimation,
  setShowToast,
  setSwipeDirection,
  showAnimation,
}: UseHomeActionsParams) => {
  const dispatch = useDispatch<AppDispatch>();
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
    (direction: Exclude<SwipeDirection, null>, product: Product) => {
      onProductAdvanceStart?.();
      setSwipeDirection(direction);
      setShowAnimation(true);

      setTimeout(() => {
        onProductSwiped?.(product);
        if (onProductSwiped) {
          setCurrentIndex(0);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
        setShowAnimation(false);
        setSwipeDirection(null);
      }, SWIPE_ANIMATION_DURATION);
    },
    [
      onProductAdvanceStart,
      onProductSwiped,
      setCurrentIndex,
      setShowAnimation,
      setSwipeDirection,
    ],
  );

  const onLike = useCallback(() => {
    if (showAnimation || !currentProduct) return;

    if (!isLoggedIn) {
      onOpenAuth();
      showToastMessage("🔐 Please sign in to add to wishlist");
      return;
    }

    advanceProduct("right", currentProduct);
    showToastMessage(`❤️ Added ${currentProduct.name} to wishlist!`);

    void dispatch(addWishlistItem({ productId: currentProduct.id }))
      .unwrap()
      .catch((err) => {
        const message =
          typeof err === "string"
            ? err
            : err instanceof Error
              ? err.message
              : "Failed to add to wishlist";
        showToastMessage(message);
      });
  }, [
    advanceProduct,
    currentProduct,
    dispatch,
    isLoggedIn,
    onOpenAuth,
    showAnimation,
    showToastMessage,
  ]);

  const onDislike = useCallback(() => {
    if (showAnimation || !currentProduct) return;

    advanceProduct("left", currentProduct);

    if (isLoggedIn) {
      void dispatch(recordProductPass(currentProduct.id)).unwrap().catch(() => {
        // Preference recording should never block the next card.
      });
    }
  }, [advanceProduct, currentProduct, dispatch, isLoggedIn, showAnimation]);

  const onAddToCart = useCallback(() => {
    if (showAnimation || !currentProduct) return;

    if (!isLoggedIn) {
      onOpenAuth();
      showToastMessage("🔐 Please sign in to add to cart");
      return;
    }

    advanceProduct("right", currentProduct);
    showToastMessage(`🛒 Added ${currentProduct.name} to cart!`);

    void dispatch(addCartItem({ productId: currentProduct.id }))
      .unwrap()
      .catch((err) => {
        const message =
          typeof err === "string"
            ? err
            : err instanceof Error
              ? err.message
              : "Failed to add to cart";
        showToastMessage(message);
      });
  }, [
    advanceProduct,
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
