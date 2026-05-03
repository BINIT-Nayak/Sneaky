import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";

import type { Product } from "../../samples/product";
import { addToCart, addToWishlist } from "../../utils/storage";

type SwipeDirection = "left" | "right" | null;

type UseHomeActionsParams = {
  currentProduct: Product | undefined;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
  setShowAnimation: Dispatch<SetStateAction<boolean>>;
  setShowToast: Dispatch<SetStateAction<string | null>>;
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
  const showToastMessage = useCallback(
    (message: string) => {
      setShowToast(message);
      setTimeout(() => setShowToast(null), 2000);
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
    if (showAnimation) return;

    if (!isLoggedIn) {
      onOpenAuth();
      showToastMessage("🔐 Please sign in to add to wishlist");
      return;
    }

    if (currentProduct) {
      advanceProduct("right");
      addToWishlist(currentProduct);
      showToastMessage(`❤️ Added ${currentProduct.name} to wishlist!`);
    }
  }, [
    advanceProduct,
    currentProduct,
    isLoggedIn,
    onOpenAuth,
    showAnimation,
    showToastMessage,
  ]);

  const onDislike = useCallback(() => {
    if (showAnimation || !currentProduct) return;

    advanceProduct("left");
  }, [advanceProduct, currentProduct, showAnimation]);

  const onAddToCart = useCallback(() => {
    if (showAnimation) return;

    if (!isLoggedIn) {
      onOpenAuth();
      showToastMessage("🔐 Please sign in to add to cart");
      return;
    }

    if (currentProduct) {
      advanceProduct("right");
      addToCart(currentProduct);
      showToastMessage(`🛒 Added ${currentProduct.name} to cart!`);
    }
  }, [
    advanceProduct,
    currentProduct,
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
