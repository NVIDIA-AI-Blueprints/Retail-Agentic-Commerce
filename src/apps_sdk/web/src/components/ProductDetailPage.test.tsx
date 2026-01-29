import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductDetailPage } from "./ProductDetailPage";
import type { Product } from "@/types";

const mockProduct: Product = {
  id: "prod_001",
  sku: "TEE-BLK-M",
  name: "Classic Tee",
  basePrice: 2500,
  stockCount: 150,
  variant: "Black",
  size: "Large",
};

const mockRecommendations: Product[] = [
  {
    id: "prod_002",
    sku: "TEE-NAT-L",
    name: "V-Neck Tee",
    basePrice: 2800,
    stockCount: 200,
    variant: "Natural",
    size: "Large",
  },
  {
    id: "prod_003",
    sku: "TEE-GRY-S",
    name: "Graphic Tee",
    basePrice: 3200,
    stockCount: 100,
    variant: "Grey",
    size: "Large",
  },
];

describe("ProductDetailPage", () => {
  const defaultProps = {
    product: mockProduct,
    recommendations: [],
    isLoadingRecommendations: false,
    onBack: vi.fn(),
    onAddToCart: vi.fn(),
    onProductClick: vi.fn(),
    onQuickAdd: vi.fn(),
  };

  it("renders product name in header and main content", () => {
    render(<ProductDetailPage {...defaultProps} />);
    
    // Product name appears in both header and main content
    const productNames = screen.getAllByText("Classic Tee");
    expect(productNames).toHaveLength(2); // header h1 and main h2
  });

  it("renders product price correctly formatted", () => {
    render(<ProductDetailPage {...defaultProps} />);
    
    expect(screen.getByText("$25.00")).toBeInTheDocument();
  });

  it("renders product variant and size", () => {
    render(<ProductDetailPage {...defaultProps} />);
    
    expect(screen.getByText("Black • Large")).toBeInTheDocument();
  });

  it("renders back button", () => {
    render(<ProductDetailPage {...defaultProps} />);
    
    const backButton = screen.getByRole("button", { name: /go back/i });
    expect(backButton).toBeInTheDocument();
  });

  it("calls onBack when back button is clicked", () => {
    const onBack = vi.fn();
    render(<ProductDetailPage {...defaultProps} onBack={onBack} />);
    
    const backButton = screen.getByRole("button", { name: /go back/i });
    fireEvent.click(backButton);
    
    expect(onBack).toHaveBeenCalled();
  });

  it("renders quantity selector with initial value of 1", () => {
    render(<ProductDetailPage {...defaultProps} />);
    
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("increments quantity when + button is clicked", () => {
    render(<ProductDetailPage {...defaultProps} />);
    
    const incrementButton = screen.getByRole("button", { name: /increase quantity/i });
    fireEvent.click(incrementButton);
    
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("decrements quantity when - button is clicked", () => {
    render(<ProductDetailPage {...defaultProps} />);
    
    // First increment to 2
    const incrementButton = screen.getByRole("button", { name: /increase quantity/i });
    fireEvent.click(incrementButton);
    
    // Then decrement
    const decrementButton = screen.getByRole("button", { name: /decrease quantity/i });
    fireEvent.click(decrementButton);
    
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("does not decrement below 1", () => {
    render(<ProductDetailPage {...defaultProps} />);
    
    const decrementButton = screen.getByRole("button", { name: /decrease quantity/i });
    fireEvent.click(decrementButton);
    
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("calls onAddToCart with product and quantity", () => {
    const onAddToCart = vi.fn();
    render(<ProductDetailPage {...defaultProps} onAddToCart={onAddToCart} />);
    
    // Increment to 3
    const incrementButton = screen.getByRole("button", { name: /increase quantity/i });
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    
    // Add to cart
    const addToCartButton = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(addToCartButton);
    
    expect(onAddToCart).toHaveBeenCalledWith(mockProduct, 3);
  });

  it("shows skeleton when loading recommendations", () => {
    render(<ProductDetailPage {...defaultProps} isLoadingRecommendations={true} />);
    
    const skeletonElements = document.querySelectorAll(".skeleton-shimmer");
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it("shows recommendations section title", () => {
    render(<ProductDetailPage {...defaultProps} recommendations={mockRecommendations} />);
    
    expect(screen.getByText("You May Also Like")).toBeInTheDocument();
  });

  it("renders recommendation cards", () => {
    render(<ProductDetailPage {...defaultProps} recommendations={mockRecommendations} />);
    
    expect(screen.getByText("V-Neck Tee")).toBeInTheDocument();
    expect(screen.getByText("Graphic Tee")).toBeInTheDocument();
  });

  it("shows no recommendations message when empty", () => {
    render(
      <ProductDetailPage
        {...defaultProps}
        recommendations={[]}
        isLoadingRecommendations={false}
      />
    );
    
    expect(screen.getByText("No recommendations available")).toBeInTheDocument();
  });

  it("calls onQuickAdd when quick add button is clicked on recommendation", () => {
    const onQuickAdd = vi.fn();
    render(
      <ProductDetailPage
        {...defaultProps}
        recommendations={mockRecommendations}
        onQuickAdd={onQuickAdd}
      />
    );
    
    const quickAddButtons = screen.getAllByRole("button", { name: /quick add/i });
    fireEvent.click(quickAddButtons[0]);
    
    expect(onQuickAdd).toHaveBeenCalledWith(mockRecommendations[0]);
  });
});
