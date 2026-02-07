import { Button } from "./components/Button/Button";
import { ButtonVariant } from "./components/Button/type";

import "./App.css";

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
    </>
  );
};
