import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfirmationCard } from "./ConfirmationCard";
import type { Product } from "@/types";

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: (props: { alt: string; fill?: boolean }) => {
    const { alt } = props;
    const imageProps: Record<string, unknown> = { ...props };
    delete imageProps.alt;
    delete imageProps.fill;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} {...imageProps} />;
  },
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
    subtotal: 5200,
    discount: 0,
    tax: 0,
    shippingPrice: 500,
    total: 5700,
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

  it("displays provided subtotal", () => {
    render(<ConfirmationCard {...defaultProps} />);

    const subtotals = screen.getAllByText("$52.00");
    expect(subtotals.length).toBeGreaterThanOrEqual(1);
  });

  it("displays shipping price", () => {
    render(<ConfirmationCard {...defaultProps} />);

    expect(screen.getByText("$5.00")).toBeInTheDocument();
  });

  it("displays provided total", () => {
    render(<ConfirmationCard {...defaultProps} />);

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
        total={6400}
        estimatedDelivery="2-3 business days"
      />
    );

    expect(screen.getByText("$12.00")).toBeInTheDocument();
    expect(screen.getByText("2-3 business days")).toBeInTheDocument();
    expect(screen.getByText("$64.00")).toBeInTheDocument();
  });

  it("renders with quantity of 1", () => {
    render(<ConfirmationCard {...defaultProps} quantity={1} subtotal={2600} total={3100} />);

    expect(screen.getByText("Qty: 1")).toBeInTheDocument();
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

  it("renders discount and tax lines when provided", () => {
    render(
      <ConfirmationCard {...defaultProps} discount={475} tax={202} total={2826} subtotal={2025} />
    );

    expect(screen.getByText("Discount")).toBeInTheDocument();
    expect(screen.getByText("-$4.75")).toBeInTheDocument();
    expect(screen.getByText("Tax")).toBeInTheDocument();
    expect(screen.getByText("$2.02")).toBeInTheDocument();
    expect(screen.getByText("$28.26")).toBeInTheDocument();
  });
});
