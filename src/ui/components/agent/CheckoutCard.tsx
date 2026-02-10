"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, Text, Button, Stack, Flex, Divider, Select } from "@kui/foundations-react-external";
import { CreditCard } from "@/components/icons";
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
  discounts?: {
    codes: string[];
    applied: Array<{
      id: string;
      code?: string;
      amount: number;
      coupon: { name: string };
      automatic?: boolean;
    }>;
    rejected?: Array<{
      code: string;
      reason: string;
      message?: string;
    }>;
  };
  messages?: Array<{
    type: "info" | "warning" | "error";
    content: string;
    code?: string;
  }>;
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
  onApplyCoupon?: (couponCode: string) => void;
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
  onApplyCoupon,
}: CheckoutCardProps) {
  const [couponInput, setCouponInput] = useState("");
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

  useEffect(() => {
    setCouponInput(checkout.discounts?.codes?.[0] ?? "");
  }, [checkout.discounts]);

  const handleApplyCoupon = () => {
    onApplyCoupon?.(couponInput.trim());
  };

  const appliedDiscounts = checkout.discounts?.applied ?? [];
  const rejectedDiscounts = checkout.discounts?.rejected ?? [];
  const warningMessages = (checkout.messages ?? []).filter((m) => m.type === "warning");
  const rejectedMessages = rejectedDiscounts.map(
    (rejected) => rejected.message ?? `Code ${rejected.code} could not be applied.`
  );
  const dedupedWarningMessages = warningMessages.filter((message) => {
    const content = message.content.trim();
    const matchesRejectedMessage = rejectedMessages.some(
      (rejectedMessage) => rejectedMessage === content
    );
    const mentionsRejectedCode = rejectedDiscounts.some((rejected) =>
      content.includes(`'${rejected.code}'`)
    );
    return !matchesRejectedMessage && !mentionsRejectedCode;
  });

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
                src={getProductImage(product?.id)}
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

        {/* Coupon input */}
        <Stack gap="2">
          <Text kind="label/semibold/sm" className="text-primary">
            Coupon code
          </Text>
          <Flex gap="2">
            <div className="nv-input nv-text-input-root flex-1">
              <input
                type="text"
                value={couponInput}
                onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                placeholder="Enter code (e.g. SAVE10)"
                className="nv-text-input-element"
                disabled={isProcessing}
                aria-label="Coupon code"
              />
            </div>
            <Button
              kind="secondary"
              onClick={handleApplyCoupon}
              disabled={isProcessing || couponInput.trim().length === 0}
              aria-label="Apply coupon"
            >
              Apply
            </Button>
          </Flex>
          {appliedDiscounts.length > 0 && (
            <Stack gap="1">
              {appliedDiscounts.map((applied) => (
                <Text key={applied.id} kind="body/regular/sm" className="text-secondary">
                  {applied.automatic ? "Auto offer" : `Code ${applied.code}`}:{" "}
                  -{formatCurrency(applied.amount)}
                </Text>
              ))}
            </Stack>
          )}
          {(rejectedDiscounts.length > 0 || dedupedWarningMessages.length > 0) && (
            <Stack gap="1">
              {rejectedDiscounts.map((rejected) => (
                <Text
                  key={`${rejected.code}-${rejected.reason}`}
                  kind="body/regular/sm"
                  className="text-amber-600 dark:text-amber-400"
                >
                  {rejected.message ?? `Code ${rejected.code} could not be applied.`}
                </Text>
              ))}
              {dedupedWarningMessages.map((message, index) => (
                <Text
                  key={`${message.code ?? "warning"}-${index}`}
                  kind="body/regular/sm"
                  className="text-amber-600 dark:text-amber-400"
                >
                  {message.content}
                </Text>
              ))}
            </Stack>
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
