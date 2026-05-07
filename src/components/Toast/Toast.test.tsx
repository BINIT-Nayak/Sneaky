import { render, screen } from "@testing-library/react";

import { Toast } from "./Toast";

describe("Toast", () => {
  it("renders nothing when message is empty", () => {
    const { container } = render(<Toast message={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the message with a status role by default", () => {
    render(<Toast message="Saved successfully" />);

    expect(screen.getByRole("status")).toHaveTextContent("Saved successfully");
  });

  it("allows alert role for error toasts", () => {
    render(<Toast message="Something went wrong" role="alert" />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Something went wrong",
    );
  });
});
