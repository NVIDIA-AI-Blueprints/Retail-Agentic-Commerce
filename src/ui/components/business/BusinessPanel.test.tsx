import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BusinessPanel } from "./BusinessPanel";
import type { CheckoutSession } from "@/types";

describe("BusinessPanel", () => {
  const mockCheckout: CheckoutSession = {
    id: "checkout_123",
    status: "ready_for_payment",
    currency: "usd",
    lineItems: [],
    subtotal: 2500,
    discount: 0,
    tax: 0,
    shipping: 500,
    total: 3000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("renders the Business badge", () => {
    render(<BusinessPanel />);
    expect(screen.getByText("Business")).toBeInTheDocument();
  });

  it("renders with section aria-label", () => {
    render(<BusinessPanel />);
    expect(screen.getByRole("region", { name: "Business Panel" })).toBeInTheDocument();
  });

  it("renders ACP REQUESTS button", () => {
    render(<BusinessPanel />);
    expect(screen.getByText("ACP REQUESTS")).toBeInTheDocument();
  });

  it("displays checkout data when provided", () => {
    render(<BusinessPanel checkout={mockCheckout} />);
    expect(screen.getByText(/"checkout_123"/)).toBeInTheDocument();
  });

  it("displays checkout status", () => {
    render(<BusinessPanel checkout={mockCheckout} />);
    expect(screen.getByText(/"ready_for_payment"/)).toBeInTheDocument();
  });
});
