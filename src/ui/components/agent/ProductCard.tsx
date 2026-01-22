"use client";

import Image from "next/image";
import { Text, Stack } from "@kui/foundations-react-external";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onBuy?: (product: Product) => void;
}

/**
 * Product card displaying t-shirt details
 * Enhanced with proper surface differentiation, borders, and hover states
 */
export function ProductCard({ product, onBuy }: ProductCardProps) {
  const handleClick = () => {
    onBuy?.(product);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onBuy?.(product);
    }
  };

  return (
    <article
      className="group h-fit cursor-pointer bg-[#c8c8d0] rounded-xl overflow-hidden transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Select ${product.name} - ${formatCurrency(product.basePrice)}`}
    >
      {/* Product Image */}
      <div className="aspect-square w-full bg-[#c8c8d0] overflow-hidden relative rounded-t-xl">
        <Image
          src="/shirt.jpeg"
          alt={product.name}
          fill
          sizes="220px"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          priority
        />
      </div>

      {/* Product Info */}
      <div
        className="bg-[#e8e8ec] rounded-b-xl transition-colors duration-300 group-hover:bg-[#f0f0f4]"
        style={{ padding: "20px" }}
      >
        <Stack gap="1.5">
          <Text kind="label/semibold/md" className="text-gray-900">
            {product.name}
          </Text>
          <Text kind="body/regular/sm" className="text-gray-600">
            {product.variant} - {product.size}
          </Text>
          <div className="pt-1">
            <Text kind="label/bold/md" className="text-gray-900">
              {formatCurrency(product.basePrice)}
            </Text>
          </div>
        </Stack>
      </div>
    </article>
  );
}
