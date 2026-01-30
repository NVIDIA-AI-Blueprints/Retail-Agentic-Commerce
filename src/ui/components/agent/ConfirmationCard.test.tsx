import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfirmationCard } from "./ConfirmationCard";
import type { Product } from "@/types";

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

describe("ConfirmationCard", () => {
  const mockProduct: Product = {
    id: "prod_1",
    sku: "TS-001",
    name: "Deluxe Shirt",
    description: "Premium quality cotton t-shirt",
    basePrice: 2600,
    stockCount: 100,
    minMargin: 0.15,
    imageUrl: "/prod_1.jpeg",
    variant: "Black",
    size: "Large",
  };

  const defaultProps = {
    product: mockProduct,
    quantity: 2,
    shippingPrice: 500,
    orderId: "ORD-ABC12345",
    estimatedDelivery: "5-7 business days",
    onStartOver: vi.fn(),
  };

  it("renders success message", () => {
    render(<ConfirmationCard {...defaultProps} />);

    expect(screen.getByText("Order Confirmed!")).toBeInTheDocument();
    expect(screen.getByText("Thank you for your purchase")).toBeInTheDocument();
  });

  it("renders product name", () => {
    render(<ConfirmationCard {...defaultProps} />);

    expect(screen.getByText("Deluxe Shirt")).toBeInTheDocument();
  });

  it("renders product variant and size", () => {
    render(<ConfirmationCard {...defaultProps} />);

    expect(screen.getByText("Black - Large")).toBeInTheDocument();
  });

  it("renders correct quantity", () => {
    render(<ConfirmationCard {...defaultProps} />);

    expect(screen.getByText("Qty: 2")).toBeInTheDocument();
  });

  it("calculates and displays correct subtotal", () => {
    render(<ConfirmationCard {...defaultProps} />);

    // Subtotal = 2600 * 2 = 5200 cents = $52.00
    const subtotals = screen.getAllByText("$52.00");
    expect(subtotals.length).toBeGreaterThanOrEqual(1);
  });

  it("displays shipping price", () => {
    render(<ConfirmationCard {...defaultProps} />);

    expect(screen.getByText("$5.00")).toBeInTheDocument();
  });

  it("calculates and displays correct total", () => {
    render(<ConfirmationCard {...defaultProps} />);

    // Total = (2600 * 2) + 500 = 5700 cents = $57.00
    expect(screen.getByText("$57.00")).toBeInTheDocument();
  });

  it("displays order ID", () => {
    render(<ConfirmationCard {...defaultProps} />);

    expect(screen.getByText("ORD-ABC12345")).toBeInTheDocument();
  });

  it("displays estimated delivery", () => {
    render(<ConfirmationCard {...defaultProps} />);

    expect(screen.getByText("5-7 business days")).toBeInTheDocument();
  });

  it("renders Start Over button", () => {
    render(<ConfirmationCard {...defaultProps} />);

    expect(screen.getByRole("button", { name: /start over/i })).toBeInTheDocument();
  });

  it("calls onStartOver when Start Over button is clicked", () => {
    const onStartOver = vi.fn();
    render(<ConfirmationCard {...defaultProps} onStartOver={onStartOver} />);

    screen.getByRole("button", { name: /start over/i }).click();

    expect(onStartOver).toHaveBeenCalled();
  });

  it("renders with different shipping price", () => {
    render(
      <ConfirmationCard
        {...defaultProps}
        shippingPrice={1200}
        estimatedDelivery="2-3 business days"
      />
    );

    expect(screen.getByText("$12.00")).toBeInTheDocument();
    expect(screen.getByText("2-3 business days")).toBeInTheDocument();
    // Total = (2600 * 2) + 1200 = 6400 cents = $64.00
    expect(screen.getByText("$64.00")).toBeInTheDocument();
  });

  it("renders with quantity of 1", () => {
    render(<ConfirmationCard {...defaultProps} quantity={1} />);

    expect(screen.getByText("Qty: 1")).toBeInTheDocument();
    // Subtotal = 2600 * 1 = 2600 cents = $26.00
    const subtotals = screen.getAllByText("$26.00");
    expect(subtotals.length).toBeGreaterThanOrEqual(1);
  });

  it("renders Order Details section", () => {
    render(<ConfirmationCard {...defaultProps} />);

    expect(screen.getByText("Order Details")).toBeInTheDocument();
  });

  it("renders Amount Paid label", () => {
    render(<ConfirmationCard {...defaultProps} />);

    expect(screen.getByText("Amount Paid")).toBeInTheDocument();
  });

});
