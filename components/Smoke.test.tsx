import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function Smoke() {
  return <div>Angle HR</div>;
}

describe("Smoke", () => {
  it("renders", () => {
    render(<Smoke />);
    expect(screen.getByText("Angle HR")).toBeInTheDocument();
  });
});
