import { Button } from "./components/Button/Button";
import { ButtonVariant } from "./components/Button/type";
import { SwipeButton } from "./components/SwipeButton/SwipeButton";
import { SwipeButtonType } from "./components/SwipeButton/type";

import "./index.css";

export const App = () => {
  return (
    <>
      {/* TODO:Remove this*/}
      <Button variant={ButtonVariant.NEUMORPHIC} glow={true} disabled={false}>
        Neumorphic Glow
      </Button>
      <Button variant={ButtonVariant.DEFAULT} glow={true}>
        Default
      </Button>
      <SwipeButton className="swie" type={SwipeButtonType.LIKE} />
      <SwipeButton
        className="swie"
        type={SwipeButtonType.DISLIKE}
        disabled={true}
      />
      <SwipeButton className="swie" type={SwipeButtonType.CART} />
    </>
  );
};
