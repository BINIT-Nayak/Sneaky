import type { FC, RefObject, TouchEventHandler } from "react";

import { Button } from "../../components/Button/Button";
import { ButtonVariant } from "../../components/Button/type";
import { SwipeButton } from "../../components/SwipeButton/SwipeButton";
import { SwipeButtonType } from "../../components/SwipeButton/type";
import type { Product } from "../../samples/product";

import styles from "./Home.module.css";

type HomeContentProps = {
  cardRef: RefObject<HTMLDivElement | null>;
  currentProduct: Product | undefined;
  isFinished: boolean;
  onAddToCart: () => void;
  onDislike: () => void;
  onLike: () => void;
  onStartOver: () => void;
  onTouchEnd: TouchEventHandler<HTMLDivElement>;
  onTouchStart: TouchEventHandler<HTMLDivElement>;
  productsError: string | null;
  showAnimation: boolean;
  swipeDirection: "left" | "right" | null;
};

export const HomeContent: FC<HomeContentProps> = ({
  cardRef,
  currentProduct,
  isFinished,
  onAddToCart,
  onDislike,
  onLike,
  onStartOver,
  onTouchEnd,
  onTouchStart,
  productsError,
  showAnimation,
  swipeDirection,
}) => {
  if (productsError) {
    return (
      <div className={styles.home__card}>
        <div className={styles.home__loading}>
          <p>Error: {productsError}</p>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className={styles.home__card}>
        <div className={styles.home__finished}>
          <h2>🎉 You've seen all products! 🎉</h2>
          <p>Check your wishlist and cart for your favorites</p>
          <Button variant={ButtonVariant.DEFAULT} glow onClick={onStartOver}>
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className={styles.home__card}>
        <div className={styles.home__loading}>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.home__card} ${showAnimation ? styles[`swipe_${swipeDirection}`] : ""}`}
      ref={cardRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className={styles.home__feed}>
        <img
          src={currentProduct.image}
          alt={currentProduct.name}
          className={styles.home__image}
          loading="lazy"
        />

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
  );
};
