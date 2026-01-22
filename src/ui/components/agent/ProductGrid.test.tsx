import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductGrid } from "./ProductGrid";
import type { Product } from "@/types";

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

describe("ProductGrid", () => {
  const mockProducts: Product[] = [
    {
      id: "prod_1",
      sku: "TS-001",
      name: "Deluxe Shirt",
      description: "Premium quality cotton t-shirt",
      basePrice: 2600,
      stockCount: 100,
      minMargin: 0.15,
      imageUrl: "",
      variant: "Black",
      size: "Large",
    },
    {
      id: "prod_2",
      sku: "TS-002",
      name: "Heavyweight",
      description: "Durable heavyweight cotton",
      basePrice: 2600,
      stockCount: 50,
      minMargin: 0.12,
      imageUrl: "",
      variant: "Natural",
      size: "Large",
    },
    {
      id: "prod_3",
      sku: "TS-003",
      name: "Vintage Tee",
      description: "Classic vintage style",
      basePrice: 2600,
      stockCount: 200,
      minMargin: 0.18,
      imageUrl: "",
      variant: "Grey",
      size: "Large",
    },
  ];

  it("renders all products in the grid", () => {
    render(<ProductGrid products={mockProducts} onSelect={vi.fn()} />);

    expect(screen.getByText("Deluxe Shirt")).toBeInTheDocument();
    expect(screen.getByText("Heavyweight")).toBeInTheDocument();
    expect(screen.getByText("Vintage Tee")).toBeInTheDocument();
  });

  it("renders correct number of product cards", () => {
    render(<ProductGrid products={mockProducts} onSelect={vi.fn()} />);

    // Count product cards by their role
    const productCards = screen.getAllByRole("button");
    expect(productCards).toHaveLength(3);
  });

  it("calls onSelect when a product card is clicked", () => {
    const onSelect = vi.fn();
    render(<ProductGrid products={mockProducts} onSelect={onSelect} />);

    // Click on the first product card
    screen.getByText("Deluxe Shirt").click();

    expect(onSelect).toHaveBeenCalledWith(mockProducts[0]);
  });

  it("renders with custom className", () => {
    const { container } = render(
      <ProductGrid products={mockProducts} onSelect={vi.fn()} className="custom-class" />
    );

    const gridElement = container.firstChild;
    expect(gridElement).toHaveClass("custom-class");
    expect(gridElement).toHaveClass("grid");
  });

  it("renders empty grid when no products", () => {
    render(<ProductGrid products={[]} onSelect={vi.fn()} />);

    expect(screen.queryByText("Deluxe Shirt")).not.toBeInTheDocument();
  });

  it("displays product prices correctly", () => {
    render(<ProductGrid products={mockProducts} onSelect={vi.fn()} />);

    // $26.00 appears for each product
    const prices = screen.getAllByText("$26.00");
    expect(prices).toHaveLength(3);
  });

  it("displays product variants", () => {
    render(<ProductGrid products={mockProducts} onSelect={vi.fn()} />);

    expect(screen.getByText("Black - Large")).toBeInTheDocument();
    expect(screen.getByText("Natural - Large")).toBeInTheDocument();
    expect(screen.getByText("Grey - Large")).toBeInTheDocument();
  });
});
