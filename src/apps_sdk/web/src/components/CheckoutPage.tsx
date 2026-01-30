import { useCallback, useState, useEffect } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  X,
  ShoppingCart as CartIcon,
  Truck,
  Zap,
  Lock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import type { CartItem, CartState, Product, CheckoutResult } from "@/types";
import { formatPrice, getProductImage } from "@/types";
import { RecommendationSkeleton } from "@/components/RecommendationSkeleton";
import { PaymentSheet } from "@/components/PaymentSheet";

/**
 * Delivery option configuration
 */
interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: typeof Truck;
}

const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "5-7 business days",
    price: 0,
    icon: Truck,
  },
  {
    id: "express",
    name: "Express Delivery",
    description: "1-2 business days",
    price: 999, // $9.99 in cents
    icon: Zap,
  },
];

// Map delivery option IDs to merchant fulfillment option IDs
const FULFILLMENT_OPTION_MAP: Record<string, string> = {
  standard: "ship_standard",
  express: "ship_express",
};

interface CheckoutPageProps {
  cartItems: CartItem[];
  cartState: CartState;
  recommendations: Product[];
  isLoadingRecommendations: boolean;
  isProcessing: boolean;
  checkoutResult: CheckoutResult | null;
  sessionId: string | null;
  onBack: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onProductClick: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onClearResult: () => void;
}

/**
 * Cart item row component for checkout page
 */
function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}) {
  const handleDecrease = useCallback(() => {
    onUpdateQuantity(item.id, item.quantity - 1);
  }, [onUpdateQuantity, item.id, item.quantity]);

  const handleIncrease = useCallback(() => {
    onUpdateQuantity(item.id, item.quantity + 1);
  }, [onUpdateQuantity, item.id, item.quantity]);

  const handleRemove = useCallback(() => {
    onRemove(item.id);
  }, [onRemove, item.id]);

  const itemTotal = item.basePrice * item.quantity;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-default bg-surface-elevated p-3 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-default">
          <img
            src={getProductImage(item.id)}
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-text">{item.name}</p>
          <p className="text-xs text-text-secondary">
            {item.variant} · {formatPrice(item.basePrice)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full bg-surface-secondary px-1.5 py-1 transition-colors dark:bg-surface-tertiary">
          <button
            className="flex h-6 w-6 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text dark:hover:bg-surface"
            onClick={handleDecrease}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" strokeWidth={2.5} />
          </button>
          <span className="min-w-[20px] px-1 text-center text-sm font-medium text-text">
            {item.quantity}
          </span>
          <button
            className="flex h-6 w-6 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text dark:hover:bg-surface"
            onClick={handleIncrease}
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" strokeWidth={2.5} />
          </button>
        </div>

        <span className="min-w-[60px] text-right text-sm font-semibold text-text">
          {formatPrice(itemTotal)}
        </span>

        <button
          className="flex h-8 w-8 items-center justify-center rounded-full border border-default text-text-tertiary transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500 dark:hover:border-red-500/50 dark:hover:bg-red-500/10"
          onClick={handleRemove}
          aria-label="Remove item"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

/**
 * Recommendation card for checkout page
 */
function RecommendationCard({
  product,
  onProductClick,
  onQuickAdd,
}: {
  product: Product;
  onProductClick: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}) {
  const handleQuickAdd = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onQuickAdd(product);
    },
    [onQuickAdd, product]
  );

  return (
    <article
      onClick={() => onProductClick(product)}
      className="group flex flex-col cursor-pointer overflow-hidden rounded-lg border border-default bg-surface-elevated transition-all hover:border-accent dark:hover:border-accent/70"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onProductClick(product);
        }
      }}
      aria-label={`View ${product.name} details`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={getProductImage(product.id)}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col gap-0.5 px-2 pt-2 pb-1.5">
        <h4 className="truncate text-xs font-medium text-text leading-tight">{product.name}</h4>
        <p className="text-xs font-semibold text-success">{formatPrice(product.basePrice)}</p>
      </div>

      <div className="px-2 pb-2">
        <button
          onClick={handleQuickAdd}
          className="flex w-full items-center justify-center gap-1 rounded-full border border-accent/30 bg-transparent px-2 py-1.5 text-xs font-medium text-accent transition-colors hover:border-accent hover:bg-accent/5 active:scale-[0.98]"
          aria-label={`Quick add ${product.name} to cart`}
        >
          <Plus className="h-3 w-3" strokeWidth={2} />
          Quick Add
        </button>
      </div>
    </article>
  );
}

/**
 * CheckoutPage Component
 *
 * Full checkout page with:
 * - Back navigation
 * - Cart items with quantity controls
 * - Order summary
 * - Checkout button with ACP branding
 * - Recommendations at the bottom
 */
export function CheckoutPage({
  cartItems,
  cartState,
  recommendations,
  isLoadingRecommendations,
  isProcessing,
  checkoutResult,
  sessionId,
  onBack,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onProductClick,
  onQuickAdd,
  onClearResult,
}: CheckoutPageProps) {
  const isEmpty = cartItems.length === 0;
  const [selectedDelivery, setSelectedDelivery] = useState<string>("standard");
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);

  const currentDelivery = DELIVERY_OPTIONS.find((d) => d.id === selectedDelivery) || DELIVERY_OPTIONS[0];
  const deliveryPrice = currentDelivery.price;
  
  // Calculate adjusted totals with selected delivery
  const adjustedTotal = cartState.subtotal + cartState.tax + deliveryPrice;

  // API base URL - relative in production, localhost in dev
  const getApiBaseUrl = useCallback(() => {
    const isViteDevServer = window.location.port === "3001" || window.location.port === "3002";
    return isViteDevServer ? "http://localhost:2091" : "";
  }, []);

  // Notify server of shipping updates via real ACP endpoint
  const notifyShippingUpdate = useCallback(
    async (option: typeof currentDelivery) => {
      if (!sessionId) {
        console.warn("[Widget] No session ID for shipping update");
        return;
      }

      const fulfillmentOptionId = FULFILLMENT_OPTION_MAP[option.id] || option.id;

      try {
        await fetch(`${getApiBaseUrl()}/acp/sessions/${sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            fulfillmentOptionId,
          }),
        });
        console.log("[Widget] Shipping updated via ACP:", option.name);
      } catch (error) {
        console.warn("[Widget] Failed to update shipping via ACP:", error);
      }
    },
    [sessionId, getApiBaseUrl]
  );

  // Handle delivery selection
  const handleSelectDelivery = useCallback(
    (optionId: string) => {
      const option = DELIVERY_OPTIONS.find((d) => d.id === optionId);
      if (option) {
        setSelectedDelivery(optionId);
        setIsDeliveryOpen(false);
        notifyShippingUpdate(option);
      }
    },
    [notifyShippingUpdate]
  );

  // Open payment sheet
  const handleOpenPayment = useCallback(() => {
    setIsPaymentSheetOpen(true);
  }, []);

  // Close payment sheet
  const handleClosePayment = useCallback(() => {
    if (!isProcessing) {
      setIsPaymentSheetOpen(false);
    }
  }, [isProcessing]);

  // Handle payment completion - calls the backend
  const handlePay = useCallback(() => {
    onCheckout();
  }, [onCheckout]);

  // Close payment sheet when checkout result comes back
  useEffect(() => {
    if (checkoutResult) {
      setIsPaymentSheetOpen(false);
    }
  }, [checkoutResult]);

  // Success state
  if (checkoutResult?.success) {
    return (
      <div className="flex min-h-screen flex-col bg-surface">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-default bg-surface px-4 py-3">
          <h1 className="flex-1 text-base font-semibold text-text">Order Confirmed</h1>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-8 w-8 text-success" strokeWidth={1.5} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-text">
            Order Placed Successfully!
          </h3>
          <p className="mb-6 text-sm text-text-secondary">
            Order ID: {checkoutResult.orderId}
          </p>
          <button
            onClick={() => {
              onClearResult();
              onBack();
            }}
            className="rounded-full bg-success px-6 py-3 font-medium text-white transition-colors hover:bg-success-hover active:scale-[0.98]"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (checkoutResult && !checkoutResult.success) {
    return (
      <div className="flex min-h-screen flex-col bg-surface">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-default bg-surface px-4 py-3">
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-surface-elevated"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-text" strokeWidth={2} />
          </button>
          <h1 className="flex-1 text-base font-semibold text-text">Checkout</h1>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 dark:bg-red-500/20">
            <AlertCircle className="h-8 w-8 text-red-500" strokeWidth={1.5} />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-text">
            Payment Failed
          </h3>
          <p className="mb-6 text-sm text-text-secondary">
            {checkoutResult.error || "Something went wrong. Please try again."}
          </p>
          <button
            onClick={onClearResult}
            className="rounded-full bg-red-500/10 px-6 py-3 font-medium text-red-500 transition-colors hover:bg-red-500/20 active:scale-[0.98] dark:bg-red-500/20 dark:hover:bg-red-500/30"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Header with back button */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-default bg-surface px-4 py-3">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-surface-elevated"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-text" strokeWidth={2} />
        </button>
        <h1 className="flex-1 text-base font-semibold text-text">Checkout</h1>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Empty cart state */}
        {isEmpty ? (
          <section className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-default bg-surface-secondary/50 px-5 py-8 transition-colors dark:bg-surface-secondary/30">
            <CartIcon className="mb-3 h-10 w-10 text-text-tertiary" strokeWidth={1.5} />
            <p className="mb-1 text-base font-medium text-text-secondary">
              Your cart is empty
            </p>
            <p className="text-sm text-text-tertiary">
              Add items from the recommendations below
            </p>
          </section>
        ) : (
          <>
            {/* Cart Section */}
            <section className="py-5">
              <h2 className="mb-4 flex items-center gap-2 px-1 text-lg font-semibold text-text">
                <CartIcon className="h-5 w-5" strokeWidth={2} />
                Your Cart
                <span className="text-sm font-normal text-text-secondary">
                  ({cartState.itemCount} items)
                </span>
              </h2>

              <div className="mb-4 flex flex-col gap-2">
                {cartItems.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemove={onRemoveItem}
                  />
                ))}
              </div>

              {/* Order Summary Panel */}
              <div className="space-y-4 rounded-3xl border border-default bg-surface-elevated px-5 pb-5 pt-4 shadow-lg transition-colors dark:shadow-none">
                {/* Delivery section */}
                <section className="border-t border-default/50 pt-3">
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                    Delivery
                  </h3>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDeliveryOpen(!isDeliveryOpen)}
                      className="flex w-full items-center justify-between rounded-xl border border-default bg-surface px-4 py-2.5 shadow-sm transition-colors hover:border-accent/50 dark:shadow-none"
                      aria-expanded={isDeliveryOpen}
                      aria-haspopup="listbox"
                    >
                      <div className="flex items-center gap-2">
                        <currentDelivery.icon className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} />
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium text-text">{currentDelivery.name}</span>
                          <span className="text-xs text-text-tertiary">{currentDelivery.description}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-success">
                          {deliveryPrice === 0 ? "Free" : formatPrice(deliveryPrice)}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-text-tertiary transition-transform ${isDeliveryOpen ? "rotate-180" : ""}`}
                          strokeWidth={2}
                        />
                      </div>
                    </button>

                    {/* Dropdown options */}
                    {isDeliveryOpen && (
                      <div
                        className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-default bg-surface shadow-lg dark:shadow-none"
                        role="listbox"
                      >
                        {DELIVERY_OPTIONS.map((option) => {
                          const Icon = option.icon;
                          const isSelected = option.id === selectedDelivery;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => handleSelectDelivery(option.id)}
                              className={`flex w-full items-center justify-between px-4 py-3 transition-colors ${
                                isSelected
                                  ? "bg-accent/10 dark:bg-accent/20"
                                  : "hover:bg-surface-secondary dark:hover:bg-surface-tertiary"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon
                                  className={`h-4 w-4 ${isSelected ? "text-accent" : "text-text-tertiary"}`}
                                  strokeWidth={1.5}
                                />
                                <div className="flex flex-col items-start">
                                  <span className={`text-sm font-medium ${isSelected ? "text-accent" : "text-text"}`}>
                                    {option.name}
                                  </span>
                                  <span className="text-xs text-text-tertiary">{option.description}</span>
                                </div>
                              </div>
                              <span className={`text-sm font-semibold ${isSelected ? "text-accent" : "text-success"}`}>
                                {option.price === 0 ? "Free" : formatPrice(option.price)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>

                {/* Order summary */}
                <section className="space-y-2 border-t border-default/50 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="text-text">{formatPrice(cartState.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Shipping</span>
                    <span className="text-text">
                      {deliveryPrice === 0 ? "Free" : formatPrice(deliveryPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Tax</span>
                    <span className="text-text">{formatPrice(cartState.tax)}</span>
                  </div>
                  <div className="flex justify-between pt-2 text-base font-semibold">
                    <span className="text-text">Total</span>
                    <span className="text-text">{formatPrice(adjustedTotal)}</span>
                  </div>
                </section>
              </div>
            </section>

            {/* Checkout Button */}
            <div className="py-5">
              <button
                className="flex w-full items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary-hover active:scale-[0.98] dark:shadow-primary/20"
                onClick={handleOpenPayment}
              >
                <Lock className="h-4 w-4" strokeWidth={2} />
                <span className="flex-1 text-center">Complete Purchase</span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                  {formatPrice(adjustedTotal)}
                </span>
              </button>
            </div>
          </>
        )}

        {/* Divider */}
        <div className="mx-0 border-t border-default" />

        {/* Recommendations Section */}
        <div className="py-5">
          <h3 className="mb-3 text-base font-semibold text-text">
            {isEmpty ? "Recommended For You" : "You May Also Like"}
          </h3>

          {/* Loading Skeleton */}
          {isLoadingRecommendations && <RecommendationSkeleton />}

          {/* Recommendations */}
          {!isLoadingRecommendations && recommendations.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {recommendations.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  product={rec}
                  onProductClick={onProductClick}
                  onQuickAdd={onQuickAdd}
                />
              ))}
            </div>
          )}

          {/* No recommendations */}
          {!isLoadingRecommendations && recommendations.length === 0 && (
            <p className="text-sm text-text-secondary">No recommendations available</p>
          )}
        </div>
      </div>

      {/* Payment Sheet */}
      <PaymentSheet
        isOpen={isPaymentSheetOpen}
        isProcessing={isProcessing}
        total={adjustedTotal}
        onClose={handleClosePayment}
        onPay={handlePay}
      />
    </div>
  );
}
