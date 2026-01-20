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

  const lowStockProduct: Product = {
    ...mockProduct,
    id: "prod_2",
    stockCount: 20,
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

  it("renders product description", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText("A timeless classic cotton t-shirt")).toBeInTheDocument();
  });

  it("renders Buy button", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByRole("button", { name: /buy/i })).toBeInTheDocument();
  });

  it("calls onBuy when Buy button is clicked", () => {
    const onBuy = vi.fn();
    render(<ProductCard product={mockProduct} onBuy={onBuy} />);
    
    fireEvent.click(screen.getByRole("button", { name: /buy/i }));
    
    expect(onBuy).toHaveBeenCalledWith(mockProduct);
  });

  it("shows Low Stock badge when stock is below 30", () => {
    render(<ProductCard product={lowStockProduct} />);
    expect(screen.getByText("Low Stock")).toBeInTheDocument();
  });

  it("does not show Low Stock badge when stock is 30 or more", () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.queryByText("Low Stock")).not.toBeInTheDocument();
  });
});
