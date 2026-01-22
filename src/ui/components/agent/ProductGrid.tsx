"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  onSelect: (product: Product) => void;
  className?: string;
  /** Enable staggered entrance animation for each card */
  animateEntrance?: boolean;
}

/**
 * Responsive grid container for product cards
 * Uses CSS Grid for consistent spacing and responsive behavior
 */
export function ProductGrid({
  products,
  onSelect,
  className = "",
  animateEntrance = false,
}: ProductGridProps) {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!animateEntrance) {
      // Show all cards immediately if no animation
      setVisibleCards(new Set(products.map((_, i) => i)));
      return;
    }

    // Staggered reveal: show each card with a delay
    const timeouts: NodeJS.Timeout[] = [];
    products.forEach((_, index) => {
      const timeout = setTimeout(() => {
        setVisibleCards((prev) => new Set([...prev, index]));
      }, index * 150); // 150ms delay between each card
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [products, animateEntrance]);

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}
      role="list"
      aria-label="Available products"
    >
      {products.map((product, index) => (
        <div
          key={product.id}
          role="listitem"
          className={`transition-all duration-500 ease-out ${
            visibleCards.has(index)
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-6 scale-95"
          }`}
        >
          <ProductCard product={product} onBuy={onSelect} />
        </div>
      ))}
    </div>
  );
}
