import { useRef, useEffect } from "react";
import { Button } from "../../components/Button/Button";
import { ButtonVariant } from "../../components/Button/type";
import { SwipeButton } from "../../components/SwipeButton/SwipeButton";
import { SwipeButtonType } from "../../components/SwipeButton/type";
import styles from "./Home.module.css";

const sampleImages = [
  "https://img.drz.lazcdn.com/static/lk/p/f96ae7148c090605e2603ac7be92cbad.jpg_960x960q80.jpg_.webp",
  "https://img.drz.lazcdn.com/static/lk/p/f96ae7148c090605e2603ac7be92cbad.jpg_960x960q80.jpg_.webp",
  "https://img.drz.lazcdn.com/static/lk/p/f96ae7148c090605e2603ac7be92cbad.jpg_960x960q80.jpg_.webp",
];

export const Home = () => {
  const cardRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className={styles.home}>
      <div className={styles.home__card} ref={cardRef}>

        {/* Scrollable image feed */}
        <div className={styles.home__feed}>
          {sampleImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Fashion item ${index + 1}`}
              className={styles.home__image}
              loading="lazy"
            />
          ))}
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
            <div className={`${styles.home__actionBtn} ${styles["home__actionBtn--dislike"]}`}>
              <SwipeButton type={SwipeButtonType.DISLIKE} />
            </div>
            <div className={`${styles.home__actionBtn} ${styles["home__actionBtn--cart"]}`}>
              <SwipeButton type={SwipeButtonType.CART} />
            </div>
            <div className={`${styles.home__actionBtn} ${styles["home__actionBtn--like"]}`}>
              <SwipeButton type={SwipeButtonType.LIKE} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};