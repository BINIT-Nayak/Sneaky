import { render, screen } from "@testing-library/react";

import { SwipeButton } from "./SwipeButton";
import { SwipeButtonType } from "./type";

describe("SwipeButton", () => {
  it.each([
    SwipeButtonType.LIKE,
    SwipeButtonType.DISLIKE,
    SwipeButtonType.CART,
  ])("renders the %s button type", (type) => {
    render(<SwipeButton type={type} />);

    expect(screen.getByText("", { selector: "[data-text]" })).toHaveAttribute(
      "data-text",
      type,
    );
  });

  it("applies disabled state and extra class name", () => {
    render(
      <SwipeButton
        className="custom-swipe-action"
        disabled
        type={SwipeButtonType.CART}
      />,
    );

    const buttonVisual = screen.getByText("", { selector: "[data-text]" });
    expect(buttonVisual).toHaveAttribute("aria-hidden", "true");
    expect(buttonVisual).toHaveClass("custom-swipe-action");
  });
});
