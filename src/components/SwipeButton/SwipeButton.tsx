import type { FC } from "react";

import { PiHeartStraightFill } from "react-icons/pi";
import { ImCross } from "react-icons/im";
import { RiShoppingCartFill } from "react-icons/ri";

import { useClasses } from "../../hooks/useClasses";
import { SwipeButtonType } from "./type";

import styles from "./SwipeButton.module.css";

export interface SwipeButtonProps {
  disabled?: boolean;
  className?: string;
  type: SwipeButtonType;
}

export const SwipeButton: FC<SwipeButtonProps> = ({
  disabled,
  className,
  type,
}) => {
  const getIcon = () => {
    switch (type) {
      case SwipeButtonType.LIKE:
        return (
          <div className={styles.swipeButton__icon}>
            <PiHeartStraightFill />
          </div>
        );

      case SwipeButtonType.DISLIKE:
        return (
          <div className={styles.swipeButton__icon}>
            <ImCross />
          </div>
        );

      case SwipeButtonType.CART:
        return (
          <div className={styles.swipeButton__icon}>
            <RiShoppingCartFill />
          </div>
        );

      default:
        return null;
    }
  };

  const mods = useClasses(styles, "swipeButton", { disabled }, className);

  return (
    <button className={mods} data-text={type}>
      {getIcon()}
    </button>
  );
};
