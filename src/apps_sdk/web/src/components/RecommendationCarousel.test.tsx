import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RecommendationCarousel } from "./RecommendationCarousel";
import type { Product } from "@/types";

describe("RecommendationCarousel", () => {
  it("renders a fallback label when variant and size are missing", () => {
    const products: Product[] = [
      {
        id: "prod_1",
        sku: "TS-001",
        name: "Classic Tee",
        basePrice: 2500,
        stockCount: 100,
      },
    ];

    render(
      <RecommendationCarousel
        products={products}
        onAddToCart={vi.fn()}
        onProductClick={vi.fn()}
      />
    );

    expect(screen.getByText("Standard")).toBeInTheDocument();
  });

  it("adds once during a primary mouse click sequence", () => {
    const product: Product = {
      id: "prod_1",
      sku: "TS-001",
      name: "Classic Tee",
      basePrice: 2500,
      stockCount: 100,
    };
    const onAddToCart = vi.fn();

    render(<RecommendationCarousel products={[product]} onAddToCart={onAddToCart} />);

    const addButton = screen.getByRole("button", { name: "Add Classic Tee to cart" });
    fireEvent.mouseDown(addButton, { button: 0 });
    fireEvent.click(addButton);

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart).toHaveBeenCalledWith(product);
  });

  it("opens product details once during a primary mouse click sequence", () => {
    const product: Product = {
      id: "prod_1",
      sku: "TS-001",
      name: "Classic Tee",
      basePrice: 2500,
      stockCount: 100,
    };
    const onProductClick = vi.fn();

    render(
      <RecommendationCarousel
        products={[product]}
        onAddToCart={vi.fn()}
        onProductClick={onProductClick}
      />
    );

    const productCard = screen.getByRole("button", { name: "View Classic Tee details" });
    fireEvent.pointerDown(productCard, { button: 0 });
    fireEvent.click(productCard);

    expect(onProductClick).toHaveBeenCalledTimes(1);
    expect(onProductClick).toHaveBeenCalledWith(product);
  });
});
