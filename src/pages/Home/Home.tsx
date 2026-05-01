// src/pages/Home/Home.tsx (updated to use localStorage)
import { useRef, useEffect, useState,useContext } from "react";
import { AuthContext } from "../../App";
import {type Product, sampleProducts } from "../../types/product";
import { addToWishlist, addToCart } from "../../utils/storage";
import { Button } from "../../components/Button/Button";
import { ButtonVariant } from "../../components/Button/type";
import { SwipeButton } from "../../components/SwipeButton/SwipeButton";
import { SwipeButtonType } from "../../components/SwipeButton/type";
import styles from "./Home.module.css";

export const Home = () => {
  const { isLoggedIn, onOpenAuth } = useContext(AuthContext);
  const cardRef = useRef<HTMLDivElement>(null);
  const [products] = useState<Product[]>(sampleProducts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  const currentProduct = products[currentIndex];
  const isFinished = currentIndex >= products.length;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    };

    card.addEventListener('mousemove', handleMouseMove);
    return () => card.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const showToastMessage = (message: string) => {
    setShowToast(message);
    setTimeout(() => setShowToast(null), 2000);
  };

  const onLike = () => {
    if (!isLoggedIn) {
      onOpenAuth(); // Open login modal
      showToastMessage("🔐 Please sign in to add to wishlist");
      return;
    }
    if (currentProduct) {
      setSwipeDirection('right');
      setShowAnimation(true);
      addToWishlist(currentProduct);
      showToastMessage(`❤️ Added ${currentProduct.name} to wishlist!`);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setShowAnimation(false);
        setSwipeDirection(null);
      }, 300);
    }
  };

  const onDislike = () => {
    setSwipeDirection('left');
    setShowAnimation(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setShowAnimation(false);
      setSwipeDirection(null);
    }, 300);
  };

  const onAddToCart = () => {
     if (!isLoggedIn) {
      onOpenAuth(); // Open login modal
      showToastMessage("🔐 Please sign in to add to cart");
      return;
    }
    if (currentProduct) {
      addToCart(currentProduct);
      showToastMessage(`🛒 Added ${currentProduct.name} to cart!`);
      const cartBtn = document.querySelector(`.${styles.home__actionBtn_cart}`);
      cartBtn?.classList.add(styles['animate-pop']);
      setTimeout(() => {
        cartBtn?.classList.remove(styles['animate-pop']);
      }, 300);
    }
  };

  if (isFinished) {
    return (
      <div className={styles.home}>
        <div className={styles.home__card}>
          <div className={styles.home__finished}>
            <h2>🎉 You've seen all products! 🎉</h2>
            <p>Check your wishlist and cart for your favorites</p>
            <Button 
              variant={ButtonVariant.DEFAULT} 
              glow
              onClick={() => setCurrentIndex(0)}
            >
              Start Over
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className={styles.home}>
        <div className={styles.home__card}>
          <div className={styles.home__loading}>
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.home}>
      {/* Toast Notification */}
      {showToast && (
        <div className={styles.home__toast}>
          {showToast}
        </div>
      )}

      <div 
        className={`${styles.home__card} ${showAnimation ? styles[`swipe_${swipeDirection}`] : ''}`} 
        ref={cardRef}
      >
        {/* Product Image */}
        <div className={styles.home__feed}>
          <img
            src={currentProduct.image}
            alt={currentProduct.name}
            className={styles.home__image}
            loading="lazy"
          />
          
          {/* Product Info Overlay */}
          <div className={styles.home__productInfo}>
            <h3 className={styles.home__productName}>{currentProduct.name}</h3>
            <p className={styles.home__productBrand}>{currentProduct.brand}</p>
            <p className={styles.home__productPrice}>
              ₹{currentProduct.price.toLocaleString()}
            </p>
            <p className={styles.home__productDesc}>{currentProduct.description}</p>
          </div>
        </div>

        {/* Bottom controls overlay */}
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
              className={`${styles.home__actionBtn} ${styles["home__actionBtn_dislike"]}`}
              onClick={onDislike}
              aria-label="Dislike"
            >
              <SwipeButton type={SwipeButtonType.DISLIKE} />
            </button>
            <button 
              className={`${styles.home__actionBtn} ${styles["home__actionBtn_cart"]}`}
              onClick={onAddToCart}
              aria-label="Add to Cart"
            >
              <SwipeButton type={SwipeButtonType.CART} />
            </button>
            <button 
              className={`${styles.home__actionBtn} ${styles["home__actionBtn_like"]}`}
              onClick={onLike}
              aria-label="Like / Add to Wishlist"
            >
              <SwipeButton type={SwipeButtonType.LIKE} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};