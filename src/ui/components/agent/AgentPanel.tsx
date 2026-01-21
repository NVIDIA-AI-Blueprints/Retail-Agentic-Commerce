"use client";

import { useState, useEffect, useCallback } from "react";
import { Stack, Flex, Text, Badge } from "@kui/foundations-react-external";
import { ChatMessage } from "./ChatMessage";
import { ProductGrid } from "./ProductGrid";
import { CheckoutCard } from "./CheckoutCard";
import { ConfirmationCard } from "./ConfirmationCard";
import { useCheckoutFlow } from "@/hooks/useCheckoutFlow";
import { mockProducts, mockChatMessages, mockCheckoutSession } from "@/data/mock-data";
import type { ChatMessage as ChatMessageType, CheckoutSession, Product } from "@/types";

/**
 * Generate a random order ID
 */
function generateOrderId(): string {
  return `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

/**
 * Create a checkout session from a selected product
 */
function createCheckoutSession(
  product: Product,
  quantity: number,
  selectedShippingId: string
): CheckoutSession {
  const selectedOption = mockCheckoutSession.fulfillmentOptions?.find(
    (opt) => opt.id === selectedShippingId
  );
  const shippingPrice = selectedOption?.price ?? 500;
  const subtotal = product.basePrice * quantity;

  return {
    ...mockCheckoutSession,
    lineItems: [
      {
        id: `li_${product.sku}`,
        item: {
          id: product.sku,
          name: product.name,
          imageUrl: product.imageUrl || "/shirt.jpeg",
        },
        quantity,
        baseAmount: product.basePrice,
        discount: 0,
        subtotal,
        tax: 0,
        total: subtotal,
      },
    ],
    subtotal,
    shipping: shippingPrice,
    total: subtotal + shippingPrice,
    selectedFulfillmentOptionId: selectedShippingId,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Left panel containing the agent chat interface and product display
 */
export function AgentPanel() {
  const [messages] = useState<ChatMessageType[]>(mockChatMessages);
  const {
    context,
    selectProduct,
    updateQuantity,
    selectShipping,
    submitPayment,
    completePayment,
    reset,
  } = useCheckoutFlow();

  // Process payment after submitting
  useEffect(() => {
    if (context.state === "processing") {
      const timer = setTimeout(() => {
        completePayment(generateOrderId());
      }, 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [context.state, completePayment]);

  // Handle pay button click
  const handlePay = useCallback(() => {
    submitPayment();
  }, [submitPayment]);

  // Handle shipping change
  const handleShippingChange = useCallback(
    (optionId: string) => {
      selectShipping(optionId);
    },
    [selectShipping]
  );

  // Handle quantity change
  const handleQuantityChange = useCallback(
    (quantity: number) => {
      updateQuantity(quantity);
    },
    [updateQuantity]
  );

  // Get the selected shipping option for confirmation
  const selectedShippingOption = mockCheckoutSession.fulfillmentOptions?.find(
    (opt) => opt.id === context.selectedShippingId
  );

  // Create checkout session based on current state
  const currentCheckout = context.selectedProduct
    ? createCheckoutSession(
        context.selectedProduct,
        context.quantity,
        context.selectedShippingId
      )
    : null;

  return (
    <section
      className="flex-1 flex flex-col h-full overflow-hidden bg-surface-raised rounded-lg"
      aria-label="Agent Panel"
    >
      {/* Header */}
      <Flex
        align="center"
        justify="start"
        className="px-6 pt-6 pb-4 border-b border-base"
      >
        <Badge kind="outline" color="gray">
          Agent
        </Badge>
      </Flex>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Stack gap="6" className="p-6">
          {/* Chat message */}
          <Stack gap="3">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </Stack>

          {/* Flow-based content */}
          {context.state === "product_selection" && (
            <>
              <Text kind="body/regular/md" className="text-secondary">
                Here are some options to check out:
              </Text>
              <ProductGrid products={mockProducts} onSelect={selectProduct} />
            </>
          )}

          {(context.state === "checkout" || context.state === "processing") &&
            currentCheckout &&
            context.selectedProduct && (
              <div className="checkout-transition">
                <CheckoutCard
                  checkout={currentCheckout}
                  product={context.selectedProduct}
                  quantity={context.quantity}
                  isProcessing={context.state === "processing"}
                  onPay={handlePay}
                  onQuantityChange={handleQuantityChange}
                  onShippingChange={handleShippingChange}
                />
              </div>
            )}

          {context.state === "confirmation" &&
            context.selectedProduct &&
            context.orderId && (
              <div className="checkout-transition">
                <ConfirmationCard
                  product={context.selectedProduct}
                  quantity={context.quantity}
                  shippingPrice={selectedShippingOption?.price ?? 500}
                  orderId={context.orderId}
                  estimatedDelivery={
                    selectedShippingOption?.estimatedDelivery ?? "5-7 business days"
                  }
                  onStartOver={reset}
                />
              </div>
            )}
        </Stack>
      </div>
    </section>
  );
}
