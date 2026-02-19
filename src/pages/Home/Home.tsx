import { Button } from "../../components/Button/Button";
import { ButtonVariant } from "../../components/Button/type";
import { SwipeButton } from "../../components/SwipeButton/SwipeButton";
import { SwipeButtonType } from "../../components/SwipeButton/type";
import style from "./Home.module.css";

export const Home = () => {
  return (
    <div className={style.homeContainer}>
      <div className={style.home}>
        <div className={style.home__content}>
          <img
            src="https://img.drz.lazcdn.com/static/lk/p/f96ae7148c090605e2603ac7be92cbad.jpg_960x960q80.jpg_.webp"
            width="100%"
          />
          <img
            src="https://img.drz.lazcdn.com/static/lk/p/f96ae7148c090605e2603ac7be92cbad.jpg_960x960q80.jpg_.webp"
            width="100%"
          />
          <img
            src="https://img.drz.lazcdn.com/static/lk/p/f96ae7148c090605e2603ac7be92cbad.jpg_960x960q80.jpg_.webp"
            width="100%"
          />
          <img
            src="https://img.drz.lazcdn.com/static/lk/p/f96ae7148c090605e2603ac7be92cbad.jpg_960x960q80.jpg_.webp"
            width="100%"
          />
          <img
            src="https://img.drz.lazcdn.com/static/lk/p/f96ae7148c090605e2603ac7be92cbad.jpg_960x960q80.jpg_.webp"
            width="100%"
          />
        </div>
        <div className={style.home__controlPanel}>
          <div
            style={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Button
              variant={ButtonVariant.NEUMORPHIC}
              style={{ "max-width": "300px" }}
            >
              See Details
            </Button>
          </div>
          <div className={style.home__controlPanel__buttons}>
            <div className={style.home__controlPanel__button}>
              <SwipeButton type={SwipeButtonType.DISLIKE} />
            </div>
            <div className={style.home__controlPanel__button}>
              <SwipeButton type={SwipeButtonType.CART} />
            </div>
            <div className={style.home__controlPanel__button}>
              <SwipeButton type={SwipeButtonType.LIKE} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
