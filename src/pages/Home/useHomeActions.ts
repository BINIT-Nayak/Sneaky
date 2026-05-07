import type { Dispatch, SetStateAction } from "react";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

import { addWishlistItem } from "../../store/fetchAPI/addWishlistItem";
import type { AppDispatch } from "../../store/sneakyStore";
import type { Product } from "../../store/types";
import { addToCart } from "../../utils/storage";

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
  const dispatch = useDispatch<AppDispatch>();
  const [wishlistSubmitting, setWishlistSubmitting] = useState(false);

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
