import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

describe("ProductCard", () => {
  const mockProduct: Product = {
    id: "prod_1",
    sku: "TS-001",
    name: "Classic Tee",
    description: "A timeless classic cotton t-shirt",
    basePrice: 2500,
    stockCount: 100,
    minMargin: 0.15,
    imageUrl: "https://placehold.co/400x400",
    variant: "Black",
    size: "Large",
  };

  it("renders product name", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Classic Tee")).toBeInTheDocument();
  });

  it("renders product variant and size", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("Black - Large")).toBeInTheDocument();
  });

  it("renders formatted price", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("$25.00")).toBeInTheDocument();
  });

  it("renders product image with alt text", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByAltText("Classic Tee")).toBeInTheDocument();
  });

  it("renders brand name", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("NVShop")).toBeInTheDocument();
  });

  it("calls onBuy when card is clicked", () => {
    const onBuy = vi.fn();
    render(<ProductCard product={mockProduct} onBuy={onBuy} />);

    // The card itself is clickable
    const card = screen.getByText("Classic Tee").closest('[data-testid="nv-card-root"]');
    fireEvent.click(card!);

    expect(onBuy).toHaveBeenCalledWith(mockProduct);
  });

  it("does not call onBuy when onBuy is not provided", () => {
    render(<ProductCard product={mockProduct} />);

    // Should not throw when clicked without onBuy handler
    const card = screen.getByText("Classic Tee").closest('[data-testid="nv-card-root"]');
    expect(() => fireEvent.click(card!)).not.toThrow();
  });
});
