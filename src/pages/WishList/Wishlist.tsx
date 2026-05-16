import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import { FiShoppingBag, FiTrash2 } from "react-icons/fi";

import bellIcon from "../../assets/bell.png";
import emptyList from "../../assets/emptyList.png";
import { Toast } from "../../components/Toast/Toast";
import { AuthContext } from "../../context/AuthContext";
import { addCartItem } from "../../store/fetchAPI/addCartItem";
import { clearWishlistItems } from "../../store/fetchAPI/clearWishlistItems";
import { deleteWishlistItem } from "../../store/fetchAPI/deleteWishlistItem";
import { fetchWishlist } from "../../store/fetchAPI/fetchWishlist";
import { useSneakyStateSlice } from "../../store/sneakyState/sneakySelectors";
import type { AppDispatch } from "../../store/sneakyStore";
import type { IWishlistItem } from "../../store/types";
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
  price: item.price,
  image: item.imageUrl,
});

const WISHLIST_SKELETON_ITEMS = 6;

type ToastMessage = {
  id: number;
  message: string;
};

export const Wishlist = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, onOpenAuth } = useContext(AuthContext);
  const [removingProductId, setRemovingProductId] = useState<string | null>(
    null,
  );
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [isClearingWishlist, setIsClearingWishlist] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<ToastMessage | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastIdRef = useRef(0);

  const wishlistItems = useSneakyStateSlice.getWishlist();
  const wishlistLoading = useSneakyStateSlice.getWishlistLoading();
  const wishlistStatus = useSneakyStateSlice.getWishlistStatus();
  const wishlistError = useSneakyStateSlice.getWishlistError();
  const isWishlistLoading = wishlistLoading || wishlistStatus === "idle";

  useEffect(() => {
    if (!isLoggedIn || wishlistStatus !== "idle") return;

    void dispatch(fetchWishlist());
  }, [dispatch, isLoggedIn, wishlistStatus]);

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
      await dispatch(addCartItem({ productId, quantity: 1 })).unwrap();
      showToastMessage(`${productName} moved closer to checkout.`);
    } catch (err) {
      setDeleteError(
        getActionErrorMessage(err, "We couldn't add this item to your cart."),
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
            alt="Empty list icon"
          />
          <div className={styles.wishlist__message}>
            Your wishlist is waiting. Log in to continue.
          </div>
          <button className={styles.wishlist__loginBtn} onClick={onOpenAuth}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (isWishlistLoading) {
    return (
      <div className={styles.wishlistContainer}>
        <div className={styles.wishlist} aria-label="Loading wishlist">
          <div
            className={`${styles.wishlist__skeleton} ${styles.wishlist__titleSkeleton}`}
          />
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
            alt="Wishlist error"
          />
          <div className={styles.wishlist__message}>{wishlistError}</div>
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
            alt="Bell icon"
          />
          <div className={styles.wishlist__message}>
            Your wishlist is empty—for now. Start liking products to save them
            here
          </div>
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
          {mappedItems.map((item) => (
            <div key={item.id} className={styles.wishlist__item}>
              <img
                src={item.image}
                alt={item.name}
                className={styles.wishlist__itemImage}
              />
              <div className={styles.wishlist__itemInfo}>
                <h3>{item.name}</h3>
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
