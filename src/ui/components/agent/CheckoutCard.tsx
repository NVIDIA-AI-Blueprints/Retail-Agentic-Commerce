"use client";

import Image from "next/image";
import { Card, Text, Button, Stack, Flex, Divider, Select } from "@kui/foundations-react-external";
import { CreditCard } from "@/components/icons";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

/**
 * Map product variant to corresponding image
 */
function getProductImage(variant: string | undefined): string {
  switch (variant?.toLowerCase()) {
    case "black":
      return "/black.jpeg";
    case "natural":
    case "white":
      return "/white.jpeg";
    case "grey":
    case "gray":
      return "/gray.jpeg";
    default:
      return "/black.jpeg";
  }
}

interface LegacyFulfillmentOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDelivery: string;
}

/**
 * Legacy line item format for CheckoutCard compatibility
 */
interface LegacyLineItem {
  id: string;
  item: {
    id: string;
    name: string | undefined;
    imageUrl: string | undefined;
  };
  quantity: number;
  baseAmount: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Legacy checkout session format for CheckoutCard compatibility
 */
interface LegacyCheckoutSession {
  id: string;
  status: string;
  currency: string;
  lineItems: LegacyLineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  fulfillmentOptions?: LegacyFulfillmentOption[];
  selectedFulfillmentOptionId?: string;
  paymentProvider?: {
    provider: string;
    supportedPaymentMethods: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface CheckoutCardProps {
  checkout: LegacyCheckoutSession;
  product?: Product;
  quantity?: number;
  isProcessing?: boolean;
  isReadyForPayment?: boolean;
  onContinue?: () => void;
  onQuantityChange?: (quantity: number) => void;
  onShippingChange?: (optionId: string) => void;
}

/**
 * Checkout summary card with item details, shipping, and payment
 */
export function CheckoutCard({
  checkout,
  product,
  quantity = 1,
  isProcessing = false,
  isReadyForPayment = true,
  onContinue,
  onQuantityChange,
  onShippingChange,
}: CheckoutCardProps) {
  const lineItem = checkout.lineItems[0];
  const fulfillmentOptions = (checkout.fulfillmentOptions ?? []) as LegacyFulfillmentOption[];
  const selectedOption = fulfillmentOptions.find(
    (opt) => opt.id === checkout.selectedFulfillmentOptionId
  );

  // Use authoritative totals from backend API response
  // The checkout object contains totals from the server (including tax, discounts, etc.)
  // Note: lineItem.baseAmount is the TOTAL for the line (already multiplied by quantity)
  // For display, we need the per-unit price
  const unitPrice = product?.basePrice ?? (lineItem ? lineItem.baseAmount / lineItem.quantity : 0);
  const itemsTotal = lineItem?.baseAmount ?? unitPrice * quantity;
  // lineItem.discount is also already the total discount for the line item
  const discount = checkout.discount > 0 ? checkout.discount : (lineItem?.discount ?? 0);
  const subtotal = checkout.subtotal;
  const shippingPrice = checkout.shipping;
  const tax = checkout.tax;
  const total = checkout.total;

  // Determine button state
  const isButtonDisabled = isProcessing || !isReadyForPayment;
  const buttonText = isProcessing
    ? "Processing..."
    : !isReadyForPayment
      ? "Complete details to continue"
      : "Continue";

  const handleDecrement = () => {
    if (quantity > 1 && onQuantityChange) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < 10 && onQuantityChange) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleShippingChange = (value: string) => {
    onShippingChange?.(value);
  };

  // Build shipping options for Select component
  const shippingItems: Array<{ value: string; children: string }> = fulfillmentOptions.map(
    (option) => ({
      value: option.id,
      children: `${option.name} - ${option.estimatedDelivery} (${formatCurrency(option.price)})`,
    })
  );

  return (
    <Card className="w-full max-w-md fade-in">
      <Stack gap="4">
        {/* Header with brand */}
        <Flex align="center" gap="2">
          <div className="w-6 h-6 rounded bg-interaction-primary-base flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-inverse-brand" />
          </div>
          <Text kind="label/bold/md" className="text-primary">
            NVShop
          </Text>
          {/* Status indicator */}
          {!isReadyForPayment && !isProcessing && (
            <span className="ml-auto text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded">
              Incomplete
            </span>
          )}
          {isProcessing && (
            <span className="ml-auto text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Processing
            </span>
          )}
        </Flex>

        {/* Line item */}
        {(lineItem || product) && (
          <Flex gap="3" align="start">
            <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
              <Image
                src={getProductImage(product?.variant)}
                alt={product?.name ?? lineItem?.item.name ?? "Product"}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <Stack gap="0.5" className="flex-1 min-w-0">
              <Text kind="label/bold/md" className="text-primary">
                {product?.name ?? lineItem?.item.name ?? "Product"}
              </Text>
              <Text kind="body/regular/sm" className="text-secondary">
                {product?.variant ?? "Black"} - {product?.size ?? "Large"}
              </Text>
              <Text kind="label/semibold/md" className="text-primary">
                {formatCurrency(unitPrice * quantity)}
              </Text>
            </Stack>
            <Flex align="center" gap="2">
              <Button
                kind="tertiary"
                size="tiny"
                aria-label="Decrease quantity"
                onClick={handleDecrement}
                disabled={quantity <= 1 || isProcessing}
              >
                -
              </Button>
              <Text kind="label/regular/md">{quantity}</Text>
              <Button
                kind="tertiary"
                size="tiny"
                aria-label="Increase quantity"
                onClick={handleIncrement}
                disabled={quantity >= 10 || isProcessing}
              >
                +
              </Button>
            </Flex>
          </Flex>
        )}

        <Divider />

        {/* Shipping selection */}
        <Stack gap="2">
          <Text kind="label/semibold/sm" className="text-primary">
            Shipping
          </Text>
          {shippingItems.length > 0 ? (
            <Select
              items={shippingItems}
              value={checkout.selectedFulfillmentOptionId ?? ""}
              onValueChange={handleShippingChange}
              placeholder="Select shipping option"
              size="medium"
              disabled={isProcessing}
            />
          ) : (
            selectedOption && (
              <Flex
                align="center"
                justify="between"
                className="bg-surface-sunken rounded-md px-3 py-2"
              >
                <Text kind="body/regular/sm" className="text-primary">
                  {selectedOption.name}
                </Text>
                <Flex align="center" gap="2">
                  <Text kind="body/regular/sm" className="text-secondary">
                    {selectedOption.estimatedDelivery}
                  </Text>
                  <Text kind="label/semibold/sm" className="text-primary">
                    {formatCurrency(selectedOption.price)}
                  </Text>
                </Flex>
              </Flex>
            )
          )}
        </Stack>

        <Divider />

        {/* Totals */}
        <Stack gap="2">
          <Flex justify="between">
            <Text kind="label/bold/md" className="text-primary">
              Total due today
            </Text>
            <Text kind="title/md" className="text-primary">
              {formatCurrency(total)}
            </Text>
          </Flex>
          {/* Items base amount */}
          <Flex justify="between">
            <Text kind="body/regular/sm" className="text-secondary">
              Items ({quantity}x)
            </Text>
            <Text kind="body/regular/sm" className="text-secondary">
              {formatCurrency(itemsTotal)}
            </Text>
          </Flex>
          {/* Discount (only show if non-zero) - highlighted with NVIDIA brand green */}
          {discount > 0 && (
            <Flex
              justify="between"
              align="center"
              className="bg-[#76b900]/15 rounded-md px-2 py-1.5 -mx-2 border border-[#76b900]/30"
            >
              <Flex align="center" gap="1">
                <span className="text-brand text-xs font-semibold">SAVINGS</span>
              </Flex>
              <Text kind="label/semibold/sm" className="text-brand">
                -{formatCurrency(discount)}
              </Text>
            </Flex>
          )}
          {/* Subtotal (after discount) */}
          <Flex justify="between">
            <Text kind="body/regular/sm" className="text-secondary">
              Subtotal
            </Text>
            <Text kind="body/regular/sm" className="text-secondary">
              {formatCurrency(subtotal)}
            </Text>
          </Flex>
          {/* Shipping */}
          <Flex justify="between">
            <Text kind="body/regular/sm" className="text-secondary">
              Shipping
            </Text>
            <Text kind="body/regular/sm" className="text-secondary">
              {formatCurrency(shippingPrice)}
            </Text>
          </Flex>
          {/* Tax (only show if non-zero) */}
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
        </Stack>

        {/* Continue button */}
        <Button
          kind="primary"
          color="neutral"
          className="w-full"
          onClick={onContinue}
          disabled={isButtonDisabled}
          aria-label={isProcessing ? "Processing" : "Continue to payment"}
        >
          {isProcessing ? (
            <Flex align="center" justify="center" gap="2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing...</span>
            </Flex>
          ) : (
            buttonText
          )}
        </Button>
      </Stack>
    </Card>
  );
}
