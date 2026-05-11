import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import bellIcon from "../../assets/bell.png";
import emptyList from "../../assets/emptyList.png";
import { AuthContext } from "../../context/AuthContext";
import { deleteWishlistItem } from "../../store/fetchAPI/deleteWishlistItem";
import { fetchWishlist } from "../../store/fetchAPI/fetchWishlist";
import { useSneakyStateSlice } from "../../store/sneakyState/sneakySelectors";
import type { AppDispatch } from "../../store/sneakyStore";
import type { IWishlistItem } from "../../store/types";

import styles from "./Wishlist.module.css";

const mapWishlistItem = (item: IWishlistItem) => ({
  id: item.productId,
  name: item.name,
  brand: item.brandName,
  price: item.price,
  image: item.imageUrl,
});

const WISHLIST_SKELETON_ITEMS = 6;

export const Wishlist = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, onOpenAuth } = useContext(AuthContext);
  const [removingProductId, setRemovingProductId] = useState<string | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const wishlistItems = useSneakyStateSlice.getWishlist();
  const wishlistLoading = useSneakyStateSlice.getWishlistLoading();
  const wishlistStatus = useSneakyStateSlice.getWishlistStatus();
  const wishlistError = useSneakyStateSlice.getWishlistError();

  useEffect(() => {
    if (!isLoggedIn || wishlistStatus !== "idle") return;

    void dispatch(fetchWishlist());
  }, [dispatch, isLoggedIn, wishlistStatus]);

  const mappedItems = wishlistItems.map(mapWishlistItem);

  const handleDeleteWishlistItem = async (productId: string) => {
    if (removingProductId) return;

    setRemovingProductId(productId);
    setDeleteError(null);

    try {
      await dispatch(deleteWishlistItem(productId)).unwrap();
    } catch (err) {
      setDeleteError(
        typeof err === "string"
          ? err
          : "We couldn't remove this item from your wishlist. Please try again.",
      );
    } finally {
      setRemovingProductId(null);
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

  if (wishlistLoading) {
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
        <h2 className={styles.wishlist__title}>My Wishlist</h2>
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
                <button
                  className={styles.wishlist__deleteBtn}
                  disabled={removingProductId !== null}
                  type="button"
                  onClick={() => void handleDeleteWishlistItem(item.id)}
                >
                  {removingProductId === item.id ? "Removing..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
