import { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from "react-icons/fi";

import emptyCart from "../../assets/emptyList.png";
import { AuthContext } from "../../context/AuthContext";
import { clearCartItems } from "../../store/fetchAPI/clearCartItems";
import { deleteCartItem } from "../../store/fetchAPI/deleteCartItem";
import { fetchCart } from "../../store/fetchAPI/fetchCart";
import { updateCartQuantity } from "../../store/fetchAPI/updateCartQuantity";
import { useSneakyStateSlice } from "../../store/sneakyState/sneakySelectors";
import type { AppDispatch } from "../../store/sneakyStore";

import styles from "./Cart.module.css";

export const Cart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, onOpenAuth } = useContext(AuthContext);
  const [submittingProductId, setSubmittingProductId] = useState<string | null>(
    null,
  );
  const [isClearing, setIsClearing] = useState(false);
  const [cartActionError, setCartActionError] = useState<string | null>(null);

  const cart = useSneakyStateSlice.getCart();
  const cartLoading = useSneakyStateSlice.getCartLoading();
  const cartStatus = useSneakyStateSlice.getCartStatus();
  const cartError = useSneakyStateSlice.getCartError();

  useEffect(() => {
    if (!isLoggedIn || cartStatus !== "idle") return;

    void dispatch(fetchCart());
  }, [cartStatus, dispatch, isLoggedIn]);

  const itemCount = useMemo(
    () => cart.reduce((count, item) => count + item.quantity, 0),
    [cart],
  );
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.itemTotal, 0),
    [cart],
  );

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
      } else {
        await dispatch(
          updateCartQuantity({ productId, quantity: newQuantity }),
        ).unwrap();
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
    } catch (err) {
      setCartActionError(
        getActionErrorMessage(err, "We couldn't remove this item."),
      );
    } finally {
      setSubmittingProductId(null);
    }
  };

  const handleClearCart = async () => {
    if (submittingProductId || isClearing) return;

    setIsClearing(true);
    setCartActionError(null);

    try {
      await dispatch(clearCartItems()).unwrap();
    } catch (err) {
      setCartActionError(
        getActionErrorMessage(err, "We couldn't clear your cart."),
      );
    } finally {
      setIsClearing(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.cartEmpty}>
          <img className={styles.cart__icon} src={emptyCart} alt="Empty cart" />
          <div className={styles.cart__message}>
            Please log in to view your cart
          </div>
          <button className={styles.cart__loginBtn} onClick={onOpenAuth}>
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.cartEmpty}>
          <img className={styles.cart__icon} src={emptyCart} alt="Loading" />
          <div className={styles.cart__message}>Loading cart...</div>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.cartEmpty}>
          <img className={styles.cart__icon} src={emptyCart} alt="Cart error" />
          <div className={styles.cart__message}>{cartError}</div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.cartEmpty}>
          <img className={styles.cart__icon} src={emptyCart} alt="Empty cart" />
          <div className={styles.cart__message}>
            Your cart is empty. Start swiping to add items!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cart}>
        <h2 className={styles.cart__title}>
          <FiShoppingBag /> My Cart ({itemCount} items)
        </h2>
        {cartActionError && (
          <div className={styles.cart__error}>{cartActionError}</div>
        )}

        <div className={styles.cart__content}>
          <div className={styles.cart__items}>
            {cart.map((item) => (
              <div key={item.productId} className={styles.cart__item}>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className={styles.cart__itemImage}
                />
                <div className={styles.cart__itemDetails}>
                  <h3 className={styles.cart__itemTitle}>{item.name}</h3>
                  <p className={styles.cart__itemBrand}>{item.brandName}</p>
                  <p className={styles.cart__itemPrice}>
                    ₹{item.price.toLocaleString()}
                  </p>
                </div>
                <div className={styles.cart__itemActions}>
                  <div className={styles.cart__quantity}>
                    <button
                      className={styles.cart__quantityBtn}
                      disabled={
                        submittingProductId !== null ||
                        isClearing ||
                        item.quantity <= 1
                      }
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
                      disabled={submittingProductId !== null || isClearing}
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
                    className={styles.cart__removeBtn}
                    disabled={submittingProductId !== null || isClearing}
                    onClick={() => {
                      void handleRemove(item.productId);
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <div className={styles.cart__itemTotal}>
                  ₹{item.itemTotal.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.cart__summary}>
            <h3 className={styles.cart__summaryTitle}>Order Summary</h3>
            <div className={styles.cart__summaryRow}>
              <span>Subtotal ({itemCount} items)</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <div className={styles.cart__summaryRow}>
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className={styles.cart__summaryDivider} />
            <div
              className={`${styles.cart__summaryRow} ${styles.cart__summaryTotal}`}
            >
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <button className={styles.cart__checkoutBtn}>
              Proceed to Checkout →
            </button>
            <button
              className={styles.cart__clearBtn}
              disabled={submittingProductId !== null || isClearing}
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
