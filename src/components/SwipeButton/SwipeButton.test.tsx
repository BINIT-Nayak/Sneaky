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

    expect(screen.getByRole("button")).toHaveAttribute("data-text", type);
  });

  it("applies disabled state and extra class name", () => {
    render(
      <SwipeButton
        className="custom-swipe-action"
        disabled
        type={SwipeButtonType.CART}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("custom-swipe-action");
  });
});
