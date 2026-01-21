"use client";

import { Flex } from "@kui/foundations-react-external";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  onSelect: (product: Product) => void;
  className?: string;
}

/**
 * Animated grid container for product cards
 */
export function ProductGrid({ products, onSelect, className = "" }: ProductGridProps) {
  return (
    <Flex gap="4" wrap="wrap" className={`fade-in ${className}`}>
      {products.map((product) => (
        <div key={product.id} className="w-[200px]">
          <ProductCard product={product} onBuy={onSelect} />
        </div>
      ))}
    </Flex>
  );
}
