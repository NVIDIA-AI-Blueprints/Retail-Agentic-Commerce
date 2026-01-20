"use client";

import { Card, Text, Stack, Divider } from "@kui/foundations-react-external";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onBuy?: (product: Product) => void;
}

/**
 * Product card displaying t-shirt details
 */
export function ProductCard({ product, onBuy }: ProductCardProps) {
  const handleClick = () => {
    onBuy?.(product);
  };

  return (
    <Card
      className="h-fit cursor-pointer hover:shadow-lg transition-shadow"
      interactive
      onClick={handleClick}
      slotMedia={
        <div className="aspect-square w-full bg-gray-700 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      }
    >
      <Stack gap="2">
        <Text kind="label/bold/md" className="text-primary">
          {product.name}
        </Text>
        <Text kind="body/regular/sm" className="text-secondary">
          {product.variant} - {product.size}
        </Text>
        <Text kind="label/bold/md" className="text-primary">
          {formatCurrency(product.basePrice)}
        </Text>
        <Divider />
        <Text kind="body/regular/xs" className="text-tertiary">
          NVShop
        </Text>
      </Stack>
    </Card>
  );
}
