"use client";

import { useState, useCallback, useEffect } from "react";
import { Stack, Flex, Text } from "@kui/foundations-react-external";
import { ChatMessage } from "./ChatMessage";
import { ProductGrid } from "./ProductGrid";
import { CheckoutCard } from "./CheckoutCard";
import { ConfirmationCard } from "./ConfirmationCard";
import { StreamingText } from "./StreamingText";
import { PaymentShippingForm } from "./PaymentShippingForm";
import { ModeTabSwitcher } from "./ModeTabSwitcher";
import { MerchantIframeContainer } from "./MerchantIframeContainer";
import { SearchPromptBar } from "./SearchPromptBar";
import { useCheckoutFlow } from "@/hooks/useCheckoutFlow";
import { useACPLog } from "@/hooks/useACPLog";
import { useAgentActivityLog } from "@/hooks/useAgentActivityLog";
import { WEBHOOK_NOTIFICATION_EVENT } from "@/components/WebhookToAgentActivityBridge";
import { mockProducts, mockChatMessages } from "@/data/mock-data";
import { getErrorMessage, getSuggestedAction } from "@/lib/errors";
import { Close } from "@/components/icons";
import type {
  ChatMessage as ChatMessageType,
  FulfillmentOption,
  Product,
  PaymentFormData,
  BillingAddressFormData,
} from "@/types";
import type { CheckoutMode } from "./ModeTabSwitcher";

/**
 * Payment Modal Component
 * Displays checkout card in an animated modal overlay
 */
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function PaymentModal({ isOpen, onClose, children }: PaymentModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250); // Match animation duration
  }, [onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`panel-modal-overlay ${isClosing ? "closing" : ""}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Payment checkout"
    >
      <div className={`panel-modal-content ${isClosing ? "closing" : ""}`}>
        <button
          className="modal-close-button"
          onClick={handleClose}
          aria-label="Close payment modal"
        >
          <Close className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

/**
 * Loading skeleton for checkout card
 */
/**
 * Webhook notification banner - displays post-purchase updates inside the Client Agent panel
 * Simulates the buyer receiving notifications from the merchant
 */
function WebhookNotificationBanner({
  notification,
  onDismiss,
}: {
  notification: {
    subject: string;
    message: string;
    status: string;
    orderId: string;
  };
  onDismiss: () => void;
}) {
  return (
    <div className="webhook-notification-banner">
      <div className="notification-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <div className="notification-content">
        <div className="notification-subject">{notification.subject}</div>
        <div className="notification-message">{notification.message}</div>
        <div className="notification-meta">
          Order: {notification.orderId.slice(0, 12)}... • {notification.status.replace(/_/g, " ")}
        </div>
      </div>
      <button className="notification-close" onClick={onDismiss} aria-label="Dismiss notification">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <style jsx>{`
        .webhook-notification-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin: 0 24px 16px 24px;
          padding: 14px 16px;
          background: linear-gradient(135deg, rgba(118, 185, 0, 0.12), rgba(118, 185, 0, 0.06));
          border: 1px solid rgba(118, 185, 0, 0.25);
          border-radius: 12px;
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .notification-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          color: #76b900;
          margin-top: 2px;
        }

        .notification-icon svg {
          width: 100%;
          height: 100%;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-subject {
          font-size: 13px;
          font-weight: 600;
          color: #76b900;
          margin-bottom: 4px;
          line-height: 1.3;
        }

        .notification-message {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.5;
          white-space: pre-wrap;
          margin-bottom: 6px;
        }

        .notification-meta {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.45);
          text-transform: capitalize;
        }

        .notification-close {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          padding: 0;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: color 0.2s;
        }

        .notification-close:hover {
          color: rgba(255, 255, 255, 0.8);
        }

        .notification-close svg {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}

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
const INTRO_TEXT =
  "Here are some great T-shirts you can shop now — from everyday basics to stylish branded tees and value packs 👕👇🏼";

// Notification state type
interface WebhookNotification {
  id: string;
  subject: string;
  message: string;
  status: string;
  orderId: string;
}

export function AgentPanel() {
  const [messages] = useState<ChatMessageType[]>(mockChatMessages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [activeMode, setActiveMode] = useState<CheckoutMode>("native");
  const [notification, setNotification] = useState<WebhookNotification | null>(null);
  const [appsSdkQuery, setAppsSdkQuery] = useState("");
  const [appsSdkLastPrompt, setAppsSdkLastPrompt] = useState<ChatMessageType | null>(null);
  const [appsSdkSearchRequest, setAppsSdkSearchRequest] = useState<{
    query: string;
    requestId: number;
  } | null>(null);
  const acpLog = useACPLog();
  const agentActivityLog = useAgentActivityLog();

  // Listen for webhook notifications from the bridge component
  useEffect(() => {
    const handleNotification = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setNotification(detail);
    };
    window.addEventListener(WEBHOOK_NOTIFICATION_EVENT, handleNotification);
    return () => window.removeEventListener(WEBHOOK_NOTIFICATION_EVENT, handleNotification);
  }, []);

  const dismissNotification = useCallback(() => setNotification(null), []);
  const {
    context,
    selectProduct,
    updateQuantity,
    selectShipping,
    applyCouponCode,
    submitPayment,
    reset,
    clearError,
    setPaymentInfo,
    setBillingAddress,
    proceedToPayment,
    backToSummary,
  } = useCheckoutFlow(acpLog, agentActivityLog);

  // Handle product selection - opens modal
  const handleSelectProduct = useCallback(
    (product: Product) => {
      selectProduct(product);
      setIsModalOpen(true);
    },
    [selectProduct]
  );

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Reset checkout flow when closing modal
    reset();
  }, [reset]);

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

  const handleApplyCoupon = useCallback(
    (couponCode: string) => {
      applyCouponCode(couponCode);
    },
    [applyCouponCode]
  );

  // Handle error retry
  const handleRetry = useCallback(() => {
    clearError();
  }, [clearError]);

  // Close modal and reset on confirmation
  const handleStartOver = useCallback(() => {
    setIsModalOpen(false);
    reset();
  }, [reset]);

  // Handle streaming text completion
  const handleTextComplete = useCallback(() => {
    setShowProducts(true);
  }, []);

  // Handle mode change
  const handleModeChange = useCallback(
    (mode: CheckoutMode) => {
      setActiveMode(mode);
      // Clear both panels when switching modes to start fresh
      acpLog.clear();
      agentActivityLog.clear();
      // Clear server-side webhook store to ensure clean slate
      fetch("/api/webhooks/acp", { method: "DELETE" }).catch(() => {
        // Ignore errors - server may not be running
      });
      // Clear any post-purchase notification when switching tabs
      setNotification(null);
      // Reset native checkout flow when switching modes
      if (mode === "apps-sdk") {
        reset();
        setIsModalOpen(false);
        setAppsSdkQuery("");
        setAppsSdkLastPrompt(null);
        setAppsSdkSearchRequest(null);
      }
    },
    [reset, acpLog, agentActivityLog]
  );

  // Handle Apps SDK checkout complete
  const handleAppsSdkCheckoutComplete = useCallback(
    // Order ID is available for future enhancements (e.g., showing notifications)
    (_orderId: string) => {
      // Intentionally unused - placeholder for future notification/toast functionality
      void _orderId;
    },
    []
  );

  const handleAppsSdkSearch = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    setAppsSdkLastPrompt({
      id: `apps-sdk-${Date.now()}`,
      role: "user",
      content: trimmedQuery,
      timestamp: new Date().toISOString(),
    });
    setAppsSdkSearchRequest({ query: trimmedQuery, requestId: Date.now() });
    setAppsSdkQuery("");
  }, []);

  // Handle continue from summary to payment form
  const handleContinueToPayment = useCallback(() => {
    proceedToPayment();
  }, [proceedToPayment]);

  // Handle back to summary from payment form
  const handleBackToSummary = useCallback(() => {
    backToSummary();
  }, [backToSummary]);

  // Handle payment form submission - actually process payment
  // Pass payment info directly to submitPayment to avoid async state update issues
  const handlePaymentFormSubmit = useCallback(
    (paymentInfo: PaymentFormData, billingAddress: BillingAddressFormData) => {
      setPaymentInfo(paymentInfo);
      setBillingAddress(billingAddress);
      submitPayment(paymentInfo, billingAddress);
    },
    [setPaymentInfo, setBillingAddress, submitPayment]
  );

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
        discount: sessionTotals.find((t) => t.type === "items_discount")?.amount ?? 0,
        tax: sessionTotals.find((t) => t.type === "tax")?.amount ?? 0,
        shipping,
        total,
        ...(context.session.discounts ? { discounts: context.session.discounts } : {}),
        ...(context.session.messages ? { messages: context.session.messages } : {}),
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

  // Determine if modal should be shown (checkout or processing states)
  const showCheckoutModal =
    isModalOpen &&
    (context.state === "checkout" || context.state === "processing") &&
    !context.error &&
    checkoutData !== null &&
    context.selectedProduct !== null;

  // Show checkout summary step (first step - with Continue button)
  const showCheckoutSummaryStep =
    showCheckoutModal && context.checkoutStep === "summary" && context.state === "checkout";

  // Show payment form step (second step - with Pay Now button)
  const showPaymentFormStep = showCheckoutModal && context.checkoutStep === "payment";

  // Show confirmation in modal
  const showConfirmationModal =
    isModalOpen &&
    context.state === "confirmation" &&
    context.selectedProduct !== null &&
    context.session?.order !== undefined;

  // Combined modal open state
  const isAnyModalOpen =
    showCheckoutModal || showConfirmationModal || (isModalOpen && context.isLoading);

  return (
    <section
      className="glass-panel flex-1 flex flex-col h-full overflow-hidden relative"
      aria-label="Agent Panel"
    >
      {/* Glass Panel Header */}
      <div className="glass-panel-header">
        <div className="glass-badge gray">
          <span className="glass-dot"></span>
          Client Agent
        </div>
      </div>

      {/* Mode Tab Switcher */}
      <ModeTabSwitcher activeMode={activeMode} onModeChange={handleModeChange} />

      {/* Webhook Notification Banner - shows post-purchase updates from merchant */}
      {notification && (
        <WebhookNotificationBanner notification={notification} onDismiss={dismissNotification} />
      )}

      {/* Native ACP Mode Content */}
      {activeMode === "native" && (
        <>
          {/* Content area */}
          <div className="glass-content flex-1 overflow-y-auto" style={{ padding: "24px 32px" }}>
            <Stack gap="6">
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

              {/* Always show product grid */}
              {!context.error && (
                <div className="ml-2">
                  <StreamingText
                    text={INTRO_TEXT}
                    speed={15}
                    onComplete={handleTextComplete}
                    className="text-secondary mb-5 block"
                  />
                  <br />
                  <div
                    className={`transition-all duration-700 ease-out ${
                      showProducts ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    }`}
                  >
                    {showProducts && (
                      <ProductGrid
                        products={mockProducts}
                        onSelect={handleSelectProduct}
                        animateEntrance
                      />
                    )}
                  </div>
                </div>
              )}
            </Stack>
          </div>

          {/* Payment Modal */}
          <PaymentModal isOpen={isAnyModalOpen} onClose={handleCloseModal}>
            {/* Loading state */}
            {context.isLoading && !checkoutData && <CheckoutSkeleton />}

            {/* Checkout Summary step (first step - with Continue button) */}
            {showCheckoutSummaryStep && checkoutData && context.selectedProduct && (
              <CheckoutCard
                checkout={checkoutData}
                product={context.selectedProduct}
                quantity={context.quantity}
                isProcessing={context.isLoading}
                isReadyForPayment={isReadyForPayment}
                onContinue={handleContinueToPayment}
                onQuantityChange={handleQuantityChange}
                onShippingChange={handleShippingChange}
                onApplyCoupon={handleApplyCoupon}
              />
            )}

            {/* Payment Form step (second step - with Pay Now button) */}
            {showPaymentFormStep && (
              <PaymentShippingForm
                onSubmit={handlePaymentFormSubmit}
                onBack={handleBackToSummary}
                isProcessing={context.state === "processing" || context.isLoading}
                initialPaymentInfo={context.paymentInfo}
                initialBillingAddress={context.billingAddress}
              />
            )}

            {/* Confirmation state */}
            {showConfirmationModal && context.session?.order && context.selectedProduct && (
              <ConfirmationCard
                product={context.selectedProduct}
                quantity={context.quantity}
                shippingPrice={shipping}
                orderId={context.session.order.id}
                estimatedDelivery={selectedShippingOption?.estimatedDelivery ?? "5-7 business days"}
                onStartOver={handleStartOver}
              />
            )}
          </PaymentModal>
        </>
      )}

      {/* Apps SDK Mode Content */}
      {activeMode === "apps-sdk" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Show user's search query as chat message */}
          {appsSdkLastPrompt && (
            <div style={{ padding: "24px 32px 16px 32px" }}>
              <ChatMessage message={appsSdkLastPrompt} />
            </div>
          )}
          {/* Search bar */}
          <div className="pb-3" style={{ paddingLeft: "16px", paddingRight: "16px" }}>
            <SearchPromptBar
              value={appsSdkQuery}
              onChange={setAppsSdkQuery}
              onSubmit={handleAppsSdkSearch}
            />
          </div>
          {/* Merchant widget iframe - only shown after search */}
          {appsSdkSearchRequest && (
            <MerchantIframeContainer
              onCheckoutComplete={handleAppsSdkCheckoutComplete}
              searchRequest={appsSdkSearchRequest}
            />
          )}
        </div>
      )}
    </section>
  );
}
