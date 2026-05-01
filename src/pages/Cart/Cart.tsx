// src/pages/Cart/Cart.tsx
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../App";
import {type CartItem } from "../../utils/storage";
import { getCart, removeFromCart, updateCartQuantity, getCartTotal, getCartItemCount, clearCart } from "../../utils/storage";
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from "react-icons/fi";
import styles from "./Cart.module.css";
import emptyCart from "../../assets/emptyList.png";

export const Cart = () => {
  const { isLoggedIn,onOpenAuth } = useContext(AuthContext);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const items = getCart();
    setCart(items);
    setTotal(getCartTotal());
    setItemCount(getCartItemCount());
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateCartQuantity(productId, newQuantity);
    loadCart(); // Refresh cart
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
    loadCart(); // Refresh cart
  };

  const handleClearCart = () => {
    clearCart();
    loadCart(); // Refresh cart
  };

  if (!isLoggedIn) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.cartEmpty}>
          <img className={styles.cart__icon} src={emptyCart} alt="Empty cart" />
          <div className={styles.cart__message}>
            Please log in to view your cart
          </div>
           <button 
          className={styles.cart__loginBtn}
          onClick={onOpenAuth}
        >
          Sign In
        </button>
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

        <div className={styles.cart__content}>
          <div className={styles.cart__items}>
            {cart.map((item) => (
              <div key={item.id} className={styles.cart__item}>
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className={styles.cart__itemImage}
                />
                <div className={styles.cart__itemDetails}>
                  <h3 className={styles.cart__itemTitle}>{item.name}</h3>
                  <p className={styles.cart__itemBrand}>{item.brand}</p>
                  <p className={styles.cart__itemPrice}>
                    ₹{item.price.toLocaleString()}
                  </p>
                </div>
                <div className={styles.cart__itemActions}>
                  <div className={styles.cart__quantity}>
                    <button 
                      className={styles.cart__quantityBtn}
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <FiMinus />
                    </button>
                    <span className={styles.cart__quantityValue}>{item.quantity}</span>
                    <button 
                      className={styles.cart__quantityBtn}
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <button 
                    className={styles.cart__removeBtn}
                    onClick={() => handleRemove(item.id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <div className={styles.cart__itemTotal}>
                  ₹{(item.price * item.quantity).toLocaleString()}
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
            <div className={`${styles.cart__summaryRow} ${styles.cart__summaryTotal}`}>
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <button className={styles.cart__checkoutBtn}>
              Proceed to Checkout →
            </button>
            <button 
              className={styles.cart__clearBtn}
              onClick={handleClearCart}
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};