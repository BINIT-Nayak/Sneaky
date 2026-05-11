import type { FC, RefObject, TouchEventHandler } from "react";

import { Button } from "../../components/Button/Button";
import { ButtonVariant } from "../../components/Button/type";
import { SwipeButton } from "../../components/SwipeButton/SwipeButton";
import { SwipeButtonType } from "../../components/SwipeButton/type";
import type { Product } from "../../store/types";

import styles from "./Home.module.css";

type HomeContentProps = {
  cardRef: RefObject<HTMLDivElement | null>;
  currentProduct: Product | undefined;
  isFinished: boolean;
  isLoading: boolean;
  isDetailsOpen: boolean;
  onAddToCart: () => void;
  onCloseDetails: () => void;
  onDislike: () => void;
  onLike: () => void;
  onOpenDetails: () => void;
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
  isLoading,
  isDetailsOpen,
  onAddToCart,
  onCloseDetails,
  onDislike,
  onLike,
  onOpenDetails,
  onStartOver,
  onTouchEnd,
  onTouchStart,
  productsError,
  showAnimation,
  swipeDirection,
}) => {
  if (isLoading) {
    return (
      <div className={styles.home__card} aria-label="Loading products">
        <div className={styles.home__feed}>
          <div
            className={`${styles.home__skeleton} ${styles.home__skeletonImage}`}
          />
          <div className={styles.home__productInfo}>
            <div
              className={`${styles.home__skeleton} ${styles.home__skeletonTitle}`}
            />
            <div
              className={`${styles.home__skeleton} ${styles.home__skeletonText}`}
            />
            <div
              className={`${styles.home__skeleton} ${styles.home__skeletonPrice}`}
            />
            <div
              className={`${styles.home__skeleton} ${styles.home__skeletonLine}`}
            />
            <div
              className={`${styles.home__skeleton} ${styles.home__skeletonLineShort}`}
            />
          </div>
        </div>

        <div className={styles.home__controls}>
          <div
            className={`${styles.home__skeleton} ${styles.home__skeletonDetail}`}
          />
          <div className={styles.home__controls__actions}>
            <div
              className={`${styles.home__skeleton} ${styles.home__skeletonAction}`}
            />
            <div
              className={`${styles.home__skeleton} ${styles.home__skeletonActionLarge}`}
            />
            <div
              className={`${styles.home__skeleton} ${styles.home__skeletonAction}`}
            />
          </div>
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className={styles.home__card}>
        <div className={styles.home__loading}>
          <p>{productsError}</p>
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
            onClick={onOpenDetails}
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

      {isDetailsOpen ? (
        <div
          className={styles.home__detailsOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-details-title"
          onClick={onCloseDetails}
        >
          <div
            className={styles.home__details}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className={styles.home__detailsClose}
              type="button"
              onClick={onCloseDetails}
              aria-label="Close product details"
            >
              ×
            </button>
            <img
              src={currentProduct.image}
              alt={currentProduct.name}
              className={styles.home__detailsImage}
            />
            <div className={styles.home__detailsContent}>
              <p className={styles.home__detailsCategory}>
                {currentProduct.category}
              </p>
              <h2 id="product-details-title">{currentProduct.name}</h2>
              <p className={styles.home__detailsBrand}>
                {currentProduct.brand}
              </p>
              <p className={styles.home__detailsPrice}>
                ₹{currentProduct.price.toLocaleString()}
              </p>
              <p className={styles.home__detailsDescription}>
                {currentProduct.description}
              </p>
              <div className={styles.home__detailsActions}>
                <Button
                  variant={ButtonVariant.NEUMORPHIC}
                  onClick={onLike}
                  glow
                >
                  Save to Wishlist
                </Button>
                <Button
                  variant={ButtonVariant.DEFAULT}
                  onClick={onAddToCart}
                  glow
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
