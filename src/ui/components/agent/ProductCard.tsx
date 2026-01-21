"use client";

import Image from "next/image";
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
        <div className="aspect-square w-full bg-surface-sunken overflow-hidden relative">
          <Image
            src="/shirt.jpeg"
            alt={product.name}
            fill
            sizes="200px"
            className="object-cover"
            priority
          />
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
