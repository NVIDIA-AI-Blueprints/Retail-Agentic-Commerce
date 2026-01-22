"use client";

import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  onSelect: (product: Product) => void;
  className?: string;
}

/**
 * Responsive grid container for product cards
 * Uses CSS Grid for consistent spacing and responsive behavior
 */
export function ProductGrid({ products, onSelect, className = "" }: ProductGridProps) {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 fade-in ${className}`}
      role="list"
      aria-label="Available products"
    >
      {products.map((product) => (
        <div key={product.id} role="listitem">
          <ProductCard product={product} onBuy={onSelect} />
        </div>
      ))}
    </div>
  );
}
