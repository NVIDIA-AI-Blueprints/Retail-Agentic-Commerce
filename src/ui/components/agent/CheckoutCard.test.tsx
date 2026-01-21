import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CheckoutCard } from "./CheckoutCard";
import type { CheckoutSession, Product } from "@/types";

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
      {
        id: "shipping_express",
        name: "Express",
        description: "2-3 business days",
        price: 1200,
        estimatedDelivery: "2-3 business days",
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

  const mockProduct: Product = {
    id: "prod_1",
    sku: "TS-001",
    name: "Deluxe Shirt",
    description: "Premium quality cotton t-shirt",
    basePrice: 2500,
    stockCount: 100,
    minMargin: 0.15,
    imageUrl: "/shirt.jpeg",
    variant: "Black",
    size: "Large",
  };

  it("renders the brand name", () => {
    render(<CheckoutCard checkout={mockCheckout} />);
    expect(screen.getByText("NVShop")).toBeInTheDocument();
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
    // The price appears multiple times (item price, subtotal, etc.)
    const prices = screen.getAllByText("$25.00");
    expect(prices.length).toBeGreaterThanOrEqual(1);
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

  describe("quantity controls", () => {
    it("renders quantity controls", () => {
      render(<CheckoutCard checkout={mockCheckout} quantity={2} />);

      expect(screen.getByRole("button", { name: /decrease quantity/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /increase quantity/i })).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("calls onQuantityChange with decremented value when minus is clicked", () => {
      const onQuantityChange = vi.fn();
      render(
        <CheckoutCard
          checkout={mockCheckout}
          quantity={3}
          onQuantityChange={onQuantityChange}
        />
      );

      screen.getByRole("button", { name: /decrease quantity/i }).click();

      expect(onQuantityChange).toHaveBeenCalledWith(2);
    });

    it("calls onQuantityChange with incremented value when plus is clicked", () => {
      const onQuantityChange = vi.fn();
      render(
        <CheckoutCard
          checkout={mockCheckout}
          quantity={3}
          onQuantityChange={onQuantityChange}
        />
      );

      screen.getByRole("button", { name: /increase quantity/i }).click();

      expect(onQuantityChange).toHaveBeenCalledWith(4);
    });

    it("disables decrement button when quantity is 1", () => {
      render(<CheckoutCard checkout={mockCheckout} quantity={1} />);

      expect(screen.getByRole("button", { name: /decrease quantity/i })).toBeDisabled();
    });

    it("disables increment button when quantity is 10", () => {
      render(<CheckoutCard checkout={mockCheckout} quantity={10} />);

      expect(screen.getByRole("button", { name: /increase quantity/i })).toBeDisabled();
    });
  });

  describe("processing state", () => {
    it("shows processing text when isProcessing is true", () => {
      render(<CheckoutCard checkout={mockCheckout} isProcessing={true} />);

      expect(screen.getByText("Processing...")).toBeInTheDocument();
    });

    it("disables pay button when processing", () => {
      render(<CheckoutCard checkout={mockCheckout} isProcessing={true} />);

      expect(screen.getByRole("button", { name: /processing payment/i })).toBeDisabled();
    });

    it("disables quantity controls when processing", () => {
      render(
        <CheckoutCard
          checkout={mockCheckout}
          quantity={5}
          isProcessing={true}
        />
      );

      expect(screen.getByRole("button", { name: /decrease quantity/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /increase quantity/i })).toBeDisabled();
    });
  });

  describe("with product prop", () => {
    it("uses product name when provided", () => {
      render(<CheckoutCard checkout={mockCheckout} product={mockProduct} />);

      expect(screen.getByText("Deluxe Shirt")).toBeInTheDocument();
    });

    it("uses product variant and size when provided", () => {
      render(<CheckoutCard checkout={mockCheckout} product={mockProduct} />);

      expect(screen.getByText("Black - Large")).toBeInTheDocument();
    });

    it("calculates total based on product price and quantity", () => {
      // Product price: 2500, quantity: 2, shipping: 500
      // Total = 2500 * 2 + 500 = 5500 = $55.00
      render(
        <CheckoutCard
          checkout={mockCheckout}
          product={mockProduct}
          quantity={2}
        />
      );

      expect(screen.getByText("$55.00")).toBeInTheDocument();
    });
  });

  describe("shipping selection", () => {
    it("renders shipping Select component when fulfillment options exist", () => {
      render(<CheckoutCard checkout={mockCheckout} />);

      // The Select component should render with shipping options
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("disables shipping Select when processing", () => {
      render(
        <CheckoutCard
          checkout={mockCheckout}
          isProcessing={true}
        />
      );

      // The Select should be disabled during processing
      const selectTrigger = screen.getByRole("combobox");
      expect(selectTrigger).toHaveAttribute("aria-disabled", "true");
    });
  });
});
