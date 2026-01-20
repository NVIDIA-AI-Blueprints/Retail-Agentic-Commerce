"use client";

import Image from "next/image";
import { Card, Text, Button, Stack, Flex, Divider } from "@kui/foundations-react-external";
import { CreditCard } from "@/components/icons";
import { formatCurrency } from "@/lib/utils";
import type { CheckoutSession } from "@/types";

interface CheckoutCardProps {
  checkout: CheckoutSession;
  onPay?: () => void;
  onShippingChange?: (optionId: string) => void;
}

/**
 * Checkout summary card with item details, shipping, and payment
 */
export function CheckoutCard({ checkout, onPay }: CheckoutCardProps) {
  const lineItem = checkout.lineItems[0];
  const selectedOption = checkout.fulfillmentOptions?.find(
    (opt) => opt.id === checkout.selectedFulfillmentOptionId
  );

  return (
    <Card className="w-full max-w-md">
      <Stack gap="4">
        {/* Header with brand */}
        <Flex align="center" gap="2">
          <div className="w-6 h-6 rounded bg-interaction-primary-base flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-inverse-brand" />
          </div>
          <Text kind="label/bold/md" className="text-primary">
            Cartsy
          </Text>
        </Flex>

        {/* Line item */}
        {lineItem && (
          <Flex gap="3" align="start">
            {lineItem.item.imageUrl && (
              <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={lineItem.item.imageUrl}
                  alt={lineItem.item.name ?? "Product"}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            )}
            <Stack gap="0.5" className="flex-1 min-w-0">
              <Text kind="label/bold/md" className="text-primary">
                {lineItem.item.name ?? "Product"}
              </Text>
              <Text kind="body/regular/sm" className="text-secondary">
                Black - Large
              </Text>
              <Text kind="label/semibold/md" className="text-primary">
                {formatCurrency(lineItem.baseAmount)}
              </Text>
            </Stack>
            <Flex align="center" gap="2">
              <Button kind="tertiary" size="tiny" aria-label="Decrease quantity">
                -
              </Button>
              <Text kind="label/regular/md">{lineItem.quantity}</Text>
              <Button kind="tertiary" size="tiny" aria-label="Increase quantity">
                +
              </Button>
            </Flex>
          </Flex>
        )}

        <Divider />

        {/* Shipping info */}
        <Stack gap="2">
          <Text kind="label/semibold/sm" className="text-primary">
            Shipping
          </Text>
          {selectedOption && (
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
              {formatCurrency(checkout.total)}
            </Text>
          </Flex>
          <Flex justify="between">
            <Text kind="body/regular/sm" className="text-secondary">
              Subtotal
            </Text>
            <Text kind="body/regular/sm" className="text-secondary">
              {formatCurrency(checkout.subtotal)}
            </Text>
          </Flex>
          <Flex justify="between">
            <Text kind="body/regular/sm" className="text-secondary">
              Shipping
            </Text>
            <Text kind="body/regular/sm" className="text-secondary">
              {formatCurrency(checkout.shipping)}
            </Text>
          </Flex>
        </Stack>

        {/* Pay button */}
        <Button
          kind="primary"
          color="neutral"
          className="w-full"
          onClick={onPay}
          aria-label="Pay with saved card"
        >
          <Flex align="center" justify="center" gap="3" className="w-full">
            <span>Pay Cartsy</span>
            <span className="opacity-30">|</span>
            <Flex align="center" gap="1">
              <CreditCard className="w-4 h-4" />
              <span>4242</span>
            </Flex>
          </Flex>
        </Button>
      </Stack>
    </Card>
  );
}
