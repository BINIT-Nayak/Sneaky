import type { FC } from "react";

import { ImCross, PiHeartStraightFill, RiShoppingCartFill } from "../Icon/Icon";

import { getClasses } from "../../hooks/useClasses";

import styles from "./SwipeButton.module.css";
import { SwipeButtonType } from "./type";

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

  const mods = getClasses(styles, "swipeButton", { disabled }, className);

  return (
    <button className={mods} data-text={type} disabled={disabled}>
      {getIcon()}
    </button>
  );
};
