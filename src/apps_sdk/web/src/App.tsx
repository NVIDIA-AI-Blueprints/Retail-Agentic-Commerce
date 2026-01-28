import { useState, useEffect, useCallback } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { LoyaltyHeader } from "@/components/LoyaltyHeader";
import { RecommendationCarousel } from "@/components/RecommendationCarousel";
import { ShoppingCart } from "@/components/ShoppingCart";
import { CheckoutButton } from "@/components/CheckoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToolOutput } from "@/hooks";
import type {
  Product,
  MerchantUser,
  CartItem,
  CartState,
  CheckoutResult,
} from "@/types";
import { calculateCartTotals } from "@/types";

// Default mock data for standalone mode
const DEFAULT_USER: MerchantUser = {
  id: "user_demo123",
  name: "John Doe",
  email: "john@example.com",
  loyaltyPoints: 1250,
  tier: "Gold",
  memberSince: "2024-03-15",
};

const DEFAULT_RECOMMENDATIONS: Product[] = [
  {
    id: "prod_001",
    sku: "TEE-BLK-M",
    name: "Classic Tee",
    basePrice: 2500,
    stockCount: 150,
    variant: "Black",
    size: "Large",
  },
  {
    id: "prod_002",
    sku: "TEE-NAT-L",
    name: "V-Neck Tee",
    basePrice: 2800,
    stockCount: 200,
    variant: "Natural",
    size: "Large",
  },
  {
    id: "prod_003",
    sku: "TEE-GRY-S",
    name: "Graphic Tee",
    basePrice: 3200,
    stockCount: 100,
    variant: "Grey",
    size: "Large",
  },
];

/**
 * Main App Component
 *
 * The merchant widget app that provides a full shopping experience.
 * Works in both standalone (simulated bridge) and production (real bridge) modes.
 * Supports light/dark mode theming via @openai/apps-sdk-ui.
 */
export function App() {
  // Get data from window.openai if available
  const toolOutput = useToolOutput();

  // User and recommendations from toolOutput or defaults
  const user: MerchantUser = (toolOutput?.user as MerchantUser) ?? DEFAULT_USER;
  const recommendations: Product[] =
    (toolOutput?.recommendations as Product[]) ?? DEFAULT_RECOMMENDATIONS;

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartState, setCartState] = useState<CartState>(() =>
    calculateCartTotals("", [])
  );

  // Checkout state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(
    null
  );

  // Update cart state when items change
  useEffect(() => {
    const newCartState = calculateCartTotals(cartState.cartId || "", cartItems);
    setCartState(newCartState);
  }, [cartItems, cartState.cartId]);

  // Add item to cart
  const handleAddToCart = useCallback((product: Product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          basePrice: product.basePrice,
          quantity: 1,
          variant: product.variant,
          size: product.size,
        },
      ];
    });
  }, []);

  // Update item quantity
  const handleUpdateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        setCartItems((prev) => prev.filter((item) => item.id !== productId));
      } else {
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          )
        );
      }
    },
    []
  );

  // Remove item from cart
  const handleRemoveItem = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  // Clear cart and result
  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setCheckoutResult(null);
  }, []);

  // Handle checkout
  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) return;

    setIsCheckingOut(true);
    setCheckoutResult(null);

    try {
      // Try to use window.openai.callTool if available
      if (window.openai?.callTool) {
        const response = await window.openai.callTool("checkout", {
          cartId: cartState.cartId,
          cartItems: cartItems,
          subtotal: cartState.subtotal,
          total: cartState.total,
        });

        const result = JSON.parse(response.result) as CheckoutResult;
        setCheckoutResult(result);

        if (result.success) {
          setCartItems([]);
        }
      } else {
        // Simulated checkout for standalone mode
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const orderId = `order_${Date.now().toString(36).toUpperCase()}`;
        setCheckoutResult({
          success: true,
          orderId,
          message: "Order placed successfully!",
        });
        setCartItems([]);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutResult({
        success: false,
        error:
          error instanceof Error ? error.message : "Checkout failed",
      });
    } finally {
      setIsCheckingOut(false);
    }
  }, [cartItems, cartState]);

  return (
    <div className="min-h-screen bg-surface transition-colors">
      {/* Theme Toggle - Fixed position */}
      <div className="absolute right-3 top-3 z-10">
        <ThemeToggle />
      </div>

      {/* Loyalty Header */}
      <LoyaltyHeader user={user} />

      {/* Main Content */}
      <div className="px-5 pb-6">
        {/* Success Message */}
        {checkoutResult?.success && (
          <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
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
              onClick={handleClearCart}
              className="rounded-full bg-success px-6 py-3 font-medium text-white transition-colors hover:bg-success-hover active:scale-[0.98]"
            >
              Continue Shopping
            </button>
          </div>
        )}

        {/* Error Message */}
        {checkoutResult && !checkoutResult.success && (
          <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 dark:bg-red-500/20">
              <AlertCircle className="h-8 w-8 text-red-500" strokeWidth={1.5} />
            </div>
            <p className="mb-6 text-sm text-text-secondary">
              {checkoutResult.error || "Checkout failed"}
            </p>
            <button
              onClick={() => setCheckoutResult(null)}
              className="rounded-full bg-red-500/10 px-6 py-3 font-medium text-red-500 transition-colors hover:bg-red-500/20 active:scale-[0.98] dark:bg-red-500/20 dark:hover:bg-red-500/30"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Normal Shopping View */}
        {!checkoutResult?.success && (
          <>
            {/* Recommendations */}
            <RecommendationCarousel
              products={recommendations}
              onAddToCart={handleAddToCart}
            />

            {/* Shopping Cart */}
            <ShoppingCart
              items={cartItems}
              cartState={cartState}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />

            {/* Checkout Button */}
            <CheckoutButton
              cartState={cartState}
              isProcessing={isCheckingOut}
              onCheckout={handleCheckout}
            />
          </>
        )}
      </div>
    </div>
  );
}
