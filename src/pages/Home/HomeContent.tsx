import { useMemo, useState } from "react";
import type { FC, RefObject, TouchEventHandler } from "react";

import { Button } from "../../components/Button/Button";
import { ButtonVariant } from "../../components/Button/type";
import { SwipeButton } from "../../components/SwipeButton/SwipeButton";
import { SwipeButtonType } from "../../components/SwipeButton/type";
import type { Product } from "../../store/types";
import {
  getOptimizedImageUrl,
  getResponsiveImageSrcSet,
} from "../../utils/imageUrl";
import {
  getSneakerDetails,
  UNIQUE_PRODUCT_MESSAGE,
} from "../../utils/productDetails";

import styles from "./Home.module.css";

type HomeContentProps = {
  cardRef: RefObject<HTMLDivElement | null>;
  currentProduct: Product | undefined;
  isAdmin?: boolean;
  isFinished: boolean;
  isLoading: boolean;
  isDetailsOpen: boolean;
  onAddToCart: () => void;
  onCloseDetails: () => void;
  onDislike: () => void;
  onEditProduct: (productId: string) => void;
  onLike: () => void;
  onOpenDetails: () => void;
  onOpenRecentlyViewed: (productId: string) => void;
  onStartOver: () => void;
  onTouchEnd: TouchEventHandler<HTMLDivElement>;
  onTouchStart: TouchEventHandler<HTMLDivElement>;
  productsError: string | null;
  recentlyViewedProducts: Product[];
  showAnimation: boolean;
  swipeDirection: "left" | "right" | null;
};

export const HomeContent: FC<HomeContentProps> = ({
  cardRef,
  currentProduct,
  isAdmin,
  isFinished,
  isLoading,
  isDetailsOpen,
  onAddToCart,
  onCloseDetails,
  onDislike,
  onEditProduct,
  onLike,
  onOpenDetails,
  onOpenRecentlyViewed,
  onStartOver,
  onTouchEnd,
  onTouchStart,
  productsError,
  recentlyViewedProducts,
  showAnimation,
  swipeDirection,
}) => {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectionProductId, setSelectionProductId] = useState<string | null>(
    null,
  );
  const sneakerDetails = useMemo(
    () => getSneakerDetails(currentProduct),
    [currentProduct],
  );
  const defaultSize = sneakerDetails.sizes[2] ?? sneakerDetails.sizes[0] ?? "";
  const defaultColor = sneakerDetails.colors[0]?.name ?? "";
  const currentSelectedSize =
    selectionProductId === currentProduct?.id
      ? selectedSize
      : defaultSize;
  const currentSelectedColor =
    selectionProductId === currentProduct?.id
      ? selectedColor
      : defaultColor;
  const productImageUrl = currentProduct
    ? getOptimizedImageUrl(currentProduct.image, { quality: 62, width: 520 })
    : "";
  const productImageSrcSet = currentProduct
    ? getResponsiveImageSrcSet(currentProduct.image, [320, 420, 520, 640], 62)
    : "";
  const productDetailsImageUrl = currentProduct
    ? getOptimizedImageUrl(currentProduct.image, { quality: 74, width: 800 })
    : "";

  if (isLoading) {
    return (
      <div className={styles.home__card} aria-label="Loading products">
        <div className={styles.home__feed}>
          <div
            className={`${styles.home__skeleton} ${styles.home__skeletonImage}`}
          />
          <div className={styles.home__productInfo}>
            <div className={styles.home__productTopline}>
              <div
                className={`${styles.home__skeleton} ${styles.home__skeletonPill}`}
              />
              <div
                className={`${styles.home__skeleton} ${styles.home__skeletonPill}`}
              />
            </div>
            <div className={styles.home__productHeader}>
              <div>
                <div
                  className={`${styles.home__skeleton} ${styles.home__skeletonTitle}`}
                />
                <div
                  className={`${styles.home__skeleton} ${styles.home__skeletonText}`}
                />
              </div>
              <div
                className={`${styles.home__skeleton} ${styles.home__skeletonPrice}`}
              />
            </div>
            <div
              className={`${styles.home__skeleton} ${styles.home__skeletonLine}`}
            />
            <div
              className={`${styles.home__skeleton} ${styles.home__skeletonLine}`}
            />
            <div
              className={`${styles.home__skeleton} ${styles.home__skeletonLineShort}`}
            />
            <p className={styles.home__loadingStatus}>Finding sneakers...</p>
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

  if (!currentProduct && !isFinished) {
    return (
      <div className={styles.home__card}>
        <div className={styles.home__loading}>
          <p>Loading products...</p>
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
          <Button
            className={styles.home__finishedAction}
            variant={ButtonVariant.DEFAULT}
            glow
            onClick={onStartOver}
          >
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return null;
  }

  return (
    <div
      className={`${styles.home__card} ${showAnimation ? styles[`swipe_${swipeDirection}`] : ""}`}
      ref={cardRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className={styles.home__feed}>
        <div className={styles.home__imageStage}>
          <img
            src={productImageUrl}
            srcSet={productImageSrcSet}
            sizes="(max-width: 480px) calc(100vw - 64px), 460px"
            alt={currentProduct.name}
            className={styles.home__image}
            decoding="sync"
            fetchPriority="high"
            height={650}
            loading="eager"
            width={520}
          />
          <div className={styles.home__imageGlow} aria-hidden="true" />
          {currentProduct.recommended ? (
            <div className={styles.home__floatingBadge}>Recommended</div>
          ) : null}
        </div>

        <div className={styles.home__productInfo}>
          <div className={styles.home__productTopline}>
            {currentProduct.category ? (
              <p className={styles.home__productCategory}>
                {currentProduct.category}
              </p>
            ) : null}
            {currentProduct.merchantName ? (
              <p className={styles.home__productMerchant}>
                {currentProduct.merchantName}
              </p>
            ) : null}
          </div>
          <div className={styles.home__productHeader}>
            <div>
              <h3 className={styles.home__productName}>
                {currentProduct.name}
              </h3>
              <p className={styles.home__productBrand}>
                {currentProduct.brand}
              </p>
            </div>
            <p className={styles.home__productPrice}>
              ₹{currentProduct.price.toLocaleString()}
            </p>
          </div>
          <p className={styles.home__productDesc}>
            {currentProduct.description}
          </p>

          {recentlyViewedProducts.length > 0 ? (
            <section
              className={styles.home__recent}
              aria-label="Recently viewed sneakers"
            >
              <div className={styles.home__recentHeader}>
                <h4>Recently Viewed</h4>
                <span>{recentlyViewedProducts.length}</span>
              </div>
              <div className={styles.home__recentList}>
                {recentlyViewedProducts.map((product) => (
                  <button
                    key={product.id}
                    className={styles.home__recentItem}
                    type="button"
                    onClick={() => onOpenRecentlyViewed(product.id)}
                  >
                    <img src={product.image} alt="" aria-hidden="true" />
                    <span>{product.name}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <div className={styles.home__controls}>
        <div className={styles.home__controls__detail}>
          <Button
            className={styles.home__detailsButton}
            variant={ButtonVariant.NEUMORPHIC}
            style={{ maxWidth: "280px", width: "100%" }}
            glow
            onClick={onOpenDetails}
          >
            ✦ See Details ✦
          </Button>
        </div>

        {isAdmin ? (
          <div className={styles.home__adminActions}>
            <Button
              variant={ButtonVariant.DEFAULT}
              onClick={() => onEditProduct(currentProduct.id)}
            >
              Admin: Edit Product
            </Button>
          </div>
        ) : null}

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
              src={productDetailsImageUrl}
              alt={currentProduct.name}
              className={styles.home__detailsImage}
              loading="lazy"
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
              <div className={styles.home__detailsMerchant}>
                <span>Partner</span>
                {currentProduct.merchantUrl ? (
                  <a
                    href={currentProduct.merchantUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${currentProduct.merchantName || "partner store"} product page`}
                  >
                    {currentProduct.merchantName || "Partner Store"}
                  </a>
                ) : (
                  <strong>{currentProduct.merchantName || "Partner Store"}</strong>
                )}
              </div>
              <div className={styles.home__detailsMeta}>
                {sneakerDetails.stockStatus ? (
                  <span>{sneakerDetails.stockStatus}</span>
                ) : null}
                {sneakerDetails.isUnique ? (
                  <span>{UNIQUE_PRODUCT_MESSAGE}</span>
                ) : (
                  <span>Selected: {currentSelectedSize}</span>
                )}
              </div>
              {!sneakerDetails.isUnique ? (
                <>
                  <div className={styles.home__optionGroup}>
                    <h3>Size</h3>
                    <div className={styles.home__sizeGrid}>
                      {sneakerDetails.sizes.map((size) => (
                        <button
                          key={size}
                          className={`${styles.home__sizeBtn} ${
                            currentSelectedSize === size
                              ? styles.home__sizeBtn_active
                              : ""
                          }`}
                          type="button"
                          aria-pressed={currentSelectedSize === size}
                          onClick={() => {
                            setSelectionProductId(currentProduct.id);
                            setSelectedSize(size);
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={styles.home__optionGroup}>
                    <h3>Color</h3>
                    <div className={styles.home__colorGrid}>
                      {sneakerDetails.colors.map((color) => (
                        <button
                          key={color.name}
                          className={`${styles.home__colorBtn} ${
                            currentSelectedColor === color.name
                              ? styles.home__colorBtn_active
                              : ""
                          }`}
                          type="button"
                          aria-label={color.name}
                          aria-pressed={currentSelectedColor === color.name}
                          onClick={() => {
                            setSelectionProductId(currentProduct.id);
                            setSelectedColor(color.name);
                          }}
                        >
                          <span style={{ backgroundColor: color.value }} />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
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
