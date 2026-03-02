"use client";

import Image from "next/image";
import { Card, Text, Button, Stack, Flex, Divider } from "@kui/foundations-react-external";
import { Check, Package } from "@/components/icons";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

/**
 * Get product image URL based on product ID
 * Images are named after product IDs: prod_1.jpeg, prod_2.jpeg, etc.
 */
function getProductImage(productId: string | undefined): string {
  if (productId && productId.startsWith("prod_")) {
    return `/${productId}.jpeg`;
  }
  // Fallback to first product image
  return "/prod_1.jpeg";
}

interface ConfirmationCardProps {
  product: Product;
  quantity: number;
  subtotal: number;
  discount?: number;
  tax?: number;
  shippingPrice: number;
  total: number;
  orderId: string;
  estimatedDelivery: string;
  onStartOver: () => void;
}

/**
 * Order confirmation display with animated success checkmark
 */
export function ConfirmationCard({
  product,
  quantity,
  subtotal,
  discount = 0,
  tax = 0,
  shippingPrice,
  total,
  orderId,
  estimatedDelivery,
  onStartOver,
}: ConfirmationCardProps) {
  return (
    <Card className="w-full max-w-md fade-in">
      <Stack gap="5">
        {/* Success header with animated checkmark */}
        <Flex direction="col" align="center" gap="3">
          <div className="w-16 h-16 rounded-full bg-[#76b900] flex items-center justify-center success-check">
            <Check className="w-8 h-8 text-white" />
          </div>
          <Stack gap="1" className="text-center">
            <Text kind="title/md" className="text-primary">
              Order Confirmed!
            </Text>
            <Text kind="body/regular/sm" className="text-secondary">
              Thank you for your purchase
            </Text>
          </Stack>
        </Flex>

        <Divider />

        {/* Order details */}
        <Stack gap="3">
          <Flex gap="2" align="center">
            <Package className="w-4 h-4 text-tertiary" />
            <Text kind="label/semibold/sm" className="text-primary">
              Order Details
            </Text>
          </Flex>

          <Flex gap="3" align="start">
            <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
              <Image
                src={getProductImage(product.id)}
                alt={product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <Stack gap="0.5" className="flex-1 min-w-0">
              <Text kind="label/bold/md" className="text-primary">
                {product.name}
              </Text>
              <Text kind="body/regular/sm" className="text-secondary">
                {product.variant} - {product.size}
              </Text>
              <Text kind="body/regular/sm" className="text-secondary">
                Qty: {quantity}
              </Text>
            </Stack>
            <Text kind="label/semibold/md" className="text-primary">
              {formatCurrency(product.basePrice * quantity)}
            </Text>
          </Flex>
        </Stack>

        <Divider />

        {/* Totals */}
        <Stack gap="2">
          <Flex justify="between">
            <Text kind="body/regular/sm" className="text-secondary">
              Subtotal
            </Text>
            <Text kind="body/regular/sm" className="text-secondary">
              {formatCurrency(subtotal)}
            </Text>
          </Flex>
          {discount > 0 && (
            <Flex justify="between">
              <Text kind="body/regular/sm" className="text-secondary">
                Discount
              </Text>
              <Text kind="body/regular/sm" className="text-secondary">
                -{formatCurrency(discount)}
              </Text>
            </Flex>
          )}
          <Flex justify="between">
            <Text kind="body/regular/sm" className="text-secondary">
              Shipping
            </Text>
            <Text kind="body/regular/sm" className="text-secondary">
              {formatCurrency(shippingPrice)}
            </Text>
          </Flex>
          {tax > 0 && (
            <Flex justify="between">
              <Text kind="body/regular/sm" className="text-secondary">
                Tax
              </Text>
              <Text kind="body/regular/sm" className="text-secondary">
                {formatCurrency(tax)}
              </Text>
            </Flex>
          )}
          <Flex justify="between">
            <Text kind="label/bold/md" className="text-primary">
              Amount Paid
            </Text>
            <Text kind="title/md" className="text-primary">
              {formatCurrency(total)}
            </Text>
          </Flex>
        </Stack>

        <Divider />

        {/* Delivery info */}
        <Stack gap="2">
          <Flex justify="between" align="center">
            <Text kind="body/regular/sm" className="text-secondary">
              Order ID
            </Text>
            <Text kind="label/regular/sm" className="text-primary font-mono">
              {orderId}
            </Text>
          </Flex>
          <Flex justify="between" align="center">
            <Text kind="body/regular/sm" className="text-secondary">
              Estimated Delivery
            </Text>
            <Text kind="label/semibold/sm" className="text-[#76b900]">
              {estimatedDelivery}
            </Text>
          </Flex>
        </Stack>

        {/* Start over button */}
        <Button
          kind="secondary"
          color="neutral"
          className="w-full"
          onClick={onStartOver}
          aria-label="Start over"
        >
          Start Over
        </Button>
      </Stack>
    </Card>
  );
}
