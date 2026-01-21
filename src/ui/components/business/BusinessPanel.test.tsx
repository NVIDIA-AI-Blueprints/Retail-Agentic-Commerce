import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BusinessPanel } from "./BusinessPanel";

describe("BusinessPanel", () => {
  it("renders the Merchant badge", () => {
    render(<BusinessPanel />);
    expect(screen.getByText("Merchant")).toBeInTheDocument();
  });

  it("renders with section aria-label", () => {
    render(<BusinessPanel />);
    expect(screen.getByRole("region", { name: "Merchant Panel" })).toBeInTheDocument();
  });

  it("renders placeholder text when no checkout is active", () => {
    render(<BusinessPanel />);
    expect(
      screen.getByText("Select a product to load settings and start the ACP flow.")
    ).toBeInTheDocument();
  });
});
