import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CheckoutCard } from "./CheckoutCard";
import type { CheckoutSession } from "@/types";

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

describe("CheckoutCard", () => {
  const mockCheckout: CheckoutSession = {
    id: "checkout_123",
    status: "ready_for_payment",
    currency: "usd",
    lineItems: [
      {
        id: "li_1",
        item: {
          id: "sku_1",
          name: "Test Shirt",
          imageUrl: "https://placehold.co/400x400",
        },
        quantity: 1,
        baseAmount: 2500,
        discount: 0,
        subtotal: 2500,
        tax: 0,
        total: 2500,
      },
    ],
    subtotal: 2500,
    discount: 0,
    tax: 0,
    shipping: 500,
    total: 3000,
    fulfillmentOptions: [
      {
        id: "shipping_standard",
        name: "Standard",
        description: "5-7 business days",
        price: 500,
        estimatedDelivery: "5-7 business days",
      },
    ],
    selectedFulfillmentOptionId: "shipping_standard",
    paymentProvider: {
      provider: "psp",
      supportedPaymentMethods: ["card"],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("renders the brand name", () => {
    render(<CheckoutCard checkout={mockCheckout} />);
    expect(screen.getByText("Cartsy")).toBeInTheDocument();
  });

  it("renders the line item name", () => {
    render(<CheckoutCard checkout={mockCheckout} />);
    expect(screen.getByText("Test Shirt")).toBeInTheDocument();
  });

  it("renders the total amount", () => {
    render(<CheckoutCard checkout={mockCheckout} />);
    expect(screen.getByText("$30.00")).toBeInTheDocument();
  });

  it("renders the subtotal", () => {
    render(<CheckoutCard checkout={mockCheckout} />);
    expect(screen.getByText("$25.00")).toBeInTheDocument();
  });

  it("renders shipping cost", () => {
    render(<CheckoutCard checkout={mockCheckout} />);
    expect(screen.getByText("$5.00")).toBeInTheDocument();
  });

  it("renders pay button with card info", () => {
    render(<CheckoutCard checkout={mockCheckout} />);
    expect(screen.getByRole("button", { name: /pay with saved card/i })).toBeInTheDocument();
  });

  it("calls onPay when pay button is clicked", () => {
    const onPay = vi.fn();
    render(<CheckoutCard checkout={mockCheckout} onPay={onPay} />);
    
    screen.getByRole("button", { name: /pay with saved card/i }).click();
    
    expect(onPay).toHaveBeenCalled();
  });
});
