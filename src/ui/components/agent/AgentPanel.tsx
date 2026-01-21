"use client";

import { useState, useCallback } from "react";
import { Stack, Flex, Text, Badge } from "@kui/foundations-react-external";
import { ChatMessage } from "./ChatMessage";
import { ProductGrid } from "./ProductGrid";
import { CheckoutCard } from "./CheckoutCard";
import { ConfirmationCard } from "./ConfirmationCard";
import { useCheckoutFlow } from "@/hooks/useCheckoutFlow";
import { mockProducts, mockChatMessages } from "@/data/mock-data";
import { getErrorMessage, getSuggestedAction } from "@/lib/errors";
import type { ChatMessage as ChatMessageType, FulfillmentOption, Product } from "@/types";

/**
 * Loading skeleton for checkout card
 */
function CheckoutSkeleton() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="bg-surface-sunken rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-base rounded" />
          <div className="h-4 w-20 bg-base rounded" />
        </div>
        <div className="flex gap-3">
          <div className="w-16 h-16 bg-base rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-base rounded" />
            <div className="h-3 w-24 bg-base rounded" />
            <div className="h-4 w-16 bg-base rounded" />
          </div>
        </div>
        <div className="h-px bg-base" />
        <div className="space-y-2">
          <div className="h-3 w-16 bg-base rounded" />
          <div className="h-10 w-full bg-base rounded" />
        </div>
        <div className="h-px bg-base" />
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-base rounded" />
            <div className="h-5 w-16 bg-base rounded" />
          </div>
        </div>
        <div className="h-10 w-full bg-base rounded" />
      </div>
    </div>
  );
}

/**
 * Error display component
 */
function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
}: {
  error: { type: string; code: string; message: string };
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  const apiError = {
    type: error.type as import("@/types").APIErrorType,
    code: error.code,
    message: error.message,
  };
  const message = getErrorMessage(apiError);
  const action = getSuggestedAction(apiError);

  return (
    <div className="w-full max-w-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <Stack gap="3">
        <Flex align="center" gap="2">
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <Text kind="label/bold/md" className="text-red-700 dark:text-red-300">
            Something went wrong
          </Text>
        </Flex>
        <Text kind="body/regular/sm" className="text-red-600 dark:text-red-400">
          {message}
        </Text>
        {action && (
          <Flex gap="2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                {action}
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 transition-colors"
              >
                Dismiss
              </button>
            )}
          </Flex>
        )}
      </Stack>
    </div>
  );
}

/**
 * Convert API fulfillment options to legacy format for CheckoutCard
 */
function convertFulfillmentOptions(
  options: FulfillmentOption[]
): { id: string; name: string; description: string; price: number; estimatedDelivery: string }[] {
  return options.map((opt) => ({
    id: opt.id,
    name: opt.title,
    description: opt.subtitle ?? "",
    price: opt.total,
    estimatedDelivery: opt.subtitle ?? "",
  }));
}

/**
 * Get total from session totals array
 */
function getSessionTotal(totals: { type: string; amount: number }[]): number {
  return totals.find((t) => t.type === "total")?.amount ?? 0;
}

/**
 * Get subtotal from session totals array
 */
function getSessionSubtotal(totals: { type: string; amount: number }[]): number {
  return totals.find((t) => t.type === "subtotal")?.amount ?? 0;
}

/**
 * Get shipping from session totals array
 */
function getSessionShipping(totals: { type: string; amount: number }[]): number {
  return totals.find((t) => t.type === "fulfillment")?.amount ?? 0;
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
    reset,
    clearError,
  } = useCheckoutFlow();

  // Handle product selection
  const handleSelectProduct = useCallback(
    (product: Product) => {
      selectProduct(product);
    },
    [selectProduct]
  );

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

  // Handle error retry
  const handleRetry = useCallback(() => {
    clearError();
  }, [clearError]);

  // Get fulfillment options from session
  const fulfillmentOptions = context.session
    ? convertFulfillmentOptions(context.session.fulfillment_options)
    : [];

  // Get selected shipping option for confirmation
  const selectedShippingOption = fulfillmentOptions.find(
    (opt) => opt.id === context.selectedShippingId
  );

  // Get totals from session
  const sessionTotals = context.session?.totals ?? [];
  const subtotal = getSessionSubtotal(sessionTotals);
  const shipping = getSessionShipping(sessionTotals);
  const total = getSessionTotal(sessionTotals);

  // Build checkout data for CheckoutCard (compatible format using legacy CheckoutSession type)
  const checkoutData = context.session
    ? {
        id: context.session.id,
        status: context.session.status,
        currency: context.session.currency,
        lineItems: context.session.line_items.map((li) => ({
          id: li.id,
          item: {
            id: li.item.id,
            name: li.name ?? undefined,
            imageUrl: li.images?.[0] ?? undefined,
          },
          quantity: li.item.quantity,
          baseAmount: li.base_amount,
          discount: li.discount,
          subtotal: li.subtotal,
          tax: li.tax,
          total: li.total,
        })),
        subtotal,
        discount: 0,
        tax: sessionTotals.find((t) => t.type === "tax")?.amount ?? 0,
        shipping,
        total,
        fulfillmentOptions,
        selectedFulfillmentOptionId: context.selectedShippingId,
        paymentProvider: {
          provider: context.session.payment_provider.provider,
          supportedPaymentMethods: context.session.payment_provider.supported_payment_methods.map(
            (m) => m.type
          ),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    : null;

  // Check if session is ready for payment
  const isReadyForPayment = context.session?.status === "ready_for_payment";

  return (
    <section
      className="flex-1 flex flex-col h-full overflow-hidden bg-surface-raised rounded-lg"
      aria-label="Agent Panel"
    >
      {/* Header */}
      <Flex align="center" justify="start" className="px-6 pt-6 pb-4 border-b border-base">
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

          {/* Error display */}
          {context.error && (
            <ErrorDisplay error={context.error} onRetry={handleRetry} onDismiss={handleRetry} />
          )}

          {/* Flow-based content */}
          {context.state === "product_selection" && !context.error && (
            <>
              <Text kind="body/regular/md" className="text-secondary">
                Here are some options to check out:
              </Text>
              <ProductGrid products={mockProducts} onSelect={handleSelectProduct} />
            </>
          )}

          {/* Loading state */}
          {context.isLoading && context.state === "product_selection" && <CheckoutSkeleton />}

          {/* Checkout state */}
          {(context.state === "checkout" || context.state === "processing") &&
            !context.error &&
            checkoutData &&
            context.selectedProduct && (
              <div className="checkout-transition">
                <CheckoutCard
                  checkout={checkoutData}
                  product={context.selectedProduct}
                  quantity={context.quantity}
                  isProcessing={context.state === "processing" || context.isLoading}
                  isReadyForPayment={isReadyForPayment}
                  onPay={handlePay}
                  onQuantityChange={handleQuantityChange}
                  onShippingChange={handleShippingChange}
                />
              </div>
            )}

          {/* Confirmation state */}
          {context.state === "confirmation" &&
            context.selectedProduct &&
            context.session?.order && (
              <div className="checkout-transition">
                <ConfirmationCard
                  product={context.selectedProduct}
                  quantity={context.quantity}
                  shippingPrice={shipping}
                  orderId={context.session.order.id}
                  orderUrl={context.session.order.permalink_url}
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
