import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "./Button";
import { ButtonVariant } from "./type";

describe("Button", () => {
  it("renders children and forwards click events", async () => {
    const onClick = jest.fn();

    render(
      <Button variant={ButtonVariant.DEFAULT} onClick={onClick}>
        Save
      </Button>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables interactions when disabled", async () => {
    const onClick = jest.fn();

    render(
      <Button variant={ButtonVariant.NEUMORPHIC} disabled onClick={onClick}>
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save" });
    await userEvent.click(button);

    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });
});
