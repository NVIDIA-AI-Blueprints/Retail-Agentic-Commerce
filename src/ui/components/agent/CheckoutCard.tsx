"use client";

import Image from "next/image";
import { Card, Text, Button, Stack, Flex, Divider, Select } from "@kui/foundations-react-external";
import { CreditCard } from "@/components/icons";
import { formatCurrency } from "@/lib/utils";
import type { CheckoutSession, Product, FulfillmentOption } from "@/types";

interface CheckoutCardProps {
  checkout: CheckoutSession;
  product?: Product;
  quantity?: number;
  isProcessing?: boolean;
  onPay?: () => void;
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
  onPay,
  onQuantityChange,
  onShippingChange,
}: CheckoutCardProps) {
  const lineItem = checkout.lineItems[0];
  const selectedOption = checkout.fulfillmentOptions?.find(
    (opt) => opt.id === checkout.selectedFulfillmentOptionId
  );

  // Calculate totals based on quantity
  const itemPrice = product?.basePrice ?? lineItem?.baseAmount ?? 0;
  const subtotal = itemPrice * quantity;
  const shippingPrice = selectedOption?.price ?? checkout.shipping;
  const total = subtotal + shippingPrice;

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
  const shippingItems: Array<{ value: string; children: string }> = (checkout.fulfillmentOptions ?? []).map(
    (option: FulfillmentOption) => ({
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
        </Flex>

        {/* Line item */}
        {(lineItem || product) && (
          <Flex gap="3" align="start">
            <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
              <Image
                src="/shirt.jpeg"
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
                {formatCurrency(itemPrice)}
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
          <Flex justify="between">
            <Text kind="body/regular/sm" className="text-secondary">
              Subtotal
            </Text>
            <Text kind="body/regular/sm" className="text-secondary">
              {formatCurrency(subtotal)}
            </Text>
          </Flex>
          <Flex justify="between">
            <Text kind="body/regular/sm" className="text-secondary">
              Shipping
            </Text>
            <Text kind="body/regular/sm" className="text-secondary">
              {formatCurrency(shippingPrice)}
            </Text>
          </Flex>
        </Stack>

        {/* Pay button */}
        <Button
          kind="primary"
          color="neutral"
          className="w-full"
          onClick={onPay}
          disabled={isProcessing}
          aria-label={isProcessing ? "Processing payment" : "Pay with saved card"}
        >
          <Flex align="center" justify="center" gap="3" className="w-full">
            {isProcessing ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>Pay Now</span>
                <span className="opacity-30">|</span>
                <Flex align="center" gap="1">
                  <CreditCard className="w-4 h-4" />
                  <span>4242</span>
                </Flex>
              </>
            )}
          </Flex>
        </Button>
      </Stack>
    </Card>
  );
}
