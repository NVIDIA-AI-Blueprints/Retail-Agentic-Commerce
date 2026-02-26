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
import type {
  ACPSessionResponse,
  CartItem,
  CartState,
  Product,
  CheckoutResult,
} from "@/types";
import { formatPrice, getProductImage } from "@/types";
import { RecommendationSkeleton } from "@/components/RecommendationSkeleton";
import { PaymentSheet, type PaymentFormData } from "@/components/PaymentSheet";

/**
 * Delivery option configuration
 * Note: Prices are display-only references. Actual shipping costs
 * are calculated by the backend when fulfillment option is selected.
 */
interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  displayPrice: number; // Display reference only - backend calculates actual
  icon: typeof Truck;
  fulfillmentOptionId: string; // Maps to merchant API fulfillment option
}

const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "5-7 business days",
    displayPrice: 599, // $5.99 - display only, backend calculates actual
    icon: Truck,
    fulfillmentOptionId: "shipping_standard", // Matches backend ID
  },
  {
    id: "express",
    name: "Express Delivery",
    description: "2-3 business days",
    displayPrice: 1299, // $12.99 - display only, backend calculates actual
    icon: Zap,
    fulfillmentOptionId: "shipping_express", // Matches backend ID
  },
];

interface CheckoutPageProps {
  cartItems: CartItem[];
  /** Cart state with totals from backend - isCalculating indicates pending update */
  cartState: CartState;
  sessionData: ACPSessionResponse | null;
  recommendations: Product[];
  isLoadingRecommendations: boolean;
  isProcessing: boolean;
  checkoutResult: CheckoutResult | null;
  onBack: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (formData?: PaymentFormData) => void;
  onProductClick: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onClearResult: () => void;
  /** Called when shipping option changes - parent handles backend call */
  onShippingUpdate: (fulfillmentOptionId: string) => Promise<void>;
  /** Called when coupon code is applied */
  onApplyCoupon: (couponCode: string) => Promise<void>;
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
  sessionData,
  recommendations,
  isLoadingRecommendations,
  isProcessing,
  checkoutResult,
  onBack,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onProductClick,
  onQuickAdd,
  onClearResult,
  onShippingUpdate,
  onApplyCoupon,
}: CheckoutPageProps) {
  const isEmpty = cartItems.length === 0;
  const [selectedDelivery, setSelectedDelivery] = useState<string>("standard");
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);
  const [isUpdatingShipping, setIsUpdatingShipping] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const currentDelivery = DELIVERY_OPTIONS.find((d) => d.id === selectedDelivery) || DELIVERY_OPTIONS[0];

  // All totals come from backend (cartState is derived from ACP session)
  // cartState.isCalculating indicates we're waiting for backend
  const isCalculating = cartState.isCalculating || isUpdatingShipping;

  // Use cartState values (which come from ACP session via cartStateFromSession)
  const subtotal = cartState.subtotal;
  const shipping = cartState.shipping;
  const tax = cartState.tax;
  const totalDiscount = cartState.discount;
  const total = cartState.total;
  const isCalculatingDiscounts = isCalculating || isApplyingCoupon;
  const calcOpacity = isCalculating ? "opacity-50" : "";
  const deliveryPrice = shipping > 0 ? formatPrice(shipping) : formatPrice(currentDelivery.displayPrice);
  const chevronClass = isDeliveryOpen ? "rotate-180" : "";
  const totalDisplay = isCalculatingDiscounts ? "..." : formatPrice(total);
  const appliedDiscounts = sessionData?.discounts?.applied ?? [];
  const rejectedDiscounts = sessionData?.discounts?.rejected ?? [];
  const warningMessages = (sessionData?.messages ?? []).filter(
    (message) => message.type === "warning"
  );
  const rejectedMessages = rejectedDiscounts.map(
    (discount) => discount.message ?? `Code ${discount.code} could not be applied.`
  );
  const dedupedWarningMessages = warningMessages.filter((message) => {
    const content = message.content.trim();
    const matchesRejectedMessage = rejectedMessages.some(
      (rejectedMessage) => rejectedMessage === content
    );
    const mentionsRejectedCode = rejectedDiscounts.some((discount) =>
      content.includes(`'${discount.code}'`)
    );
    return !matchesRejectedMessage && !mentionsRejectedCode;
  });

  useEffect(() => {
    setCouponCode(sessionData?.discounts?.codes?.[0] ?? "");
  }, [sessionData?.discounts]);

  // Handle delivery selection - calls parent to update backend
  const handleSelectDelivery = useCallback(
    async (optionId: string) => {
      const option = DELIVERY_OPTIONS.find((d) => d.id === optionId);
      if (option) {
        const previousSelection = selectedDelivery;
        setSelectedDelivery(optionId);
        setIsDeliveryOpen(false);
        
        // Show loading state while backend calculates new totals
        setIsUpdatingShipping(true);
        try {
          // Parent handles the backend call and updates ACP session
          await onShippingUpdate(option.fulfillmentOptionId);
        } catch (error) {
          console.warn("[Widget] Failed to update shipping, reverting selection:", error);
          // Revert to previous selection on error
          setSelectedDelivery(previousSelection);
        } finally {
          setIsUpdatingShipping(false);
        }
      }
    },
    [onShippingUpdate, selectedDelivery]
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

  // Handle payment completion - calls the backend with form data for personalization
  const handlePay = useCallback((formData: PaymentFormData) => {
    onCheckout(formData);
  }, [onCheckout]);

  const handleApplyCoupon = useCallback(async () => {
    setIsApplyingCoupon(true);
    try {
      await onApplyCoupon(couponCode.trim());
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [couponCode, onApplyCoupon]);

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
                        {isUpdatingShipping ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-text-tertiary border-t-accent" />
                        ) : (
                          <span className="text-sm font-semibold text-success">
                            {deliveryPrice}
                          </span>
                        )}
                        <ChevronDown
                          className={`h-4 w-4 text-text-tertiary transition-transform ${chevronClass}`}
                          strokeWidth={2}
                        />
                      </div>
                    </button>

                    {/* Dropdown options - each option shows its own displayPrice consistently */}
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
                                {formatPrice(option.displayPrice)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>

                {/* Coupon section */}
                <section className="space-y-2 border-t border-default/50 pt-3">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                    Coupon
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code (e.g. SAVE10)"
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-default bg-surface-elevated px-4 py-3 text-sm text-text placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      disabled={isCalculatingDiscounts}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="rounded-xl border border-default bg-surface px-4 py-3 text-sm font-medium text-text transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isCalculatingDiscounts || couponCode.trim().length === 0}
                    >
                      Apply
                    </button>
                  </div>
                  {appliedDiscounts.length > 0 && (
                    <div className="space-y-1">
                      {appliedDiscounts.map((discount) => (
                        <p key={discount.id} className="text-xs text-text-secondary">
                          {discount.automatic ? "Auto offer" : `Code ${discount.code}`}: -
                          {formatPrice(discount.amount)}
                        </p>
                      ))}
                    </div>
                  )}
                  {(rejectedDiscounts.length > 0 || dedupedWarningMessages.length > 0) && (
                    <div className="space-y-1">
                      {rejectedDiscounts.map((discount) => (
                        <p
                          key={`${discount.code}-${discount.reason}`}
                          className="text-xs text-amber-600 dark:text-amber-400"
                        >
                          {discount.message ?? `Code ${discount.code} could not be applied.`}
                        </p>
                      ))}
                      {dedupedWarningMessages.map((message, index) => (
                        <p
                          key={`${message.code ?? "warning"}-${index}`}
                          className="text-xs text-amber-600 dark:text-amber-400"
                        >
                          {message.content}
                        </p>
                      ))}
                    </div>
                  )}
                </section>

                {/* Order summary - all values from backend */}
                <section className="space-y-2 border-t border-default/50 pt-3">
                  {isCalculating && (
                    <div className="flex items-center justify-center gap-2 py-2 text-sm text-text-secondary">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-text-tertiary border-t-accent" />
                      <span>Calculating totals...</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className={`text-text ${calcOpacity}`}>
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Discount
                      </span>
                      <span className={`font-medium text-emerald-600 dark:text-emerald-400 ${calcOpacity}`}>
                        −{formatPrice(totalDiscount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Shipping</span>
                    <span className={`text-text ${calcOpacity}`}>
                      {deliveryPrice}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Tax</span>
                    <span className={`text-text ${calcOpacity}`}>
                      {formatPrice(tax)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 text-base font-semibold">
                    <span className="text-text">Total</span>
                    <span className={`text-text ${calcOpacity}`}>
                      {formatPrice(total)}
                    </span>
                  </div>
                </section>
              </div>
            </section>

            {/* Checkout Button */}
            <div className="py-5">
              <button
                className="flex w-full items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-primary/20"
                onClick={handleOpenPayment}
                disabled={isCalculatingDiscounts}
              >
                <Lock className="h-4 w-4" strokeWidth={2} />
                <span className="flex-1 text-center">Complete Purchase</span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                  {totalDisplay}
                </span>
              </button>
            </div>
          </>
        )}

        {/* Divider */}
        <div className="mx-0 border-t border-default" />

        {/* Recommendations Section */}
        <div className="py-5">
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
        total={total}
        onClose={handleClosePayment}
        onPay={handlePay}
      />
    </div>
  );
}
