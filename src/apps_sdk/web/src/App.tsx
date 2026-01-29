import { useState, useEffect, useCallback } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { LoyaltyHeader } from "@/components/LoyaltyHeader";
import { RecommendationCarousel } from "@/components/RecommendationCarousel";
import { ShoppingCart } from "@/components/ShoppingCart";
import { CheckoutButton } from "@/components/CheckoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProductDetailPage } from "@/components/ProductDetailPage";
import { useToolOutput } from "@/hooks";
import type {
  Product,
  MerchantUser,
  CartItem,
  CartState,
  CheckoutResult,
} from "@/types";
import { calculateCartTotals } from "@/types";

/**
 * Widget page state for navigation
 */
type WidgetPage = "browse" | "product_detail";

// Default mock data for standalone mode
const DEFAULT_USER: MerchantUser = {
  id: "user_demo123",
  name: "John Doe",
  email: "john@example.com",
  loyaltyPoints: 1250,
  tier: "Gold",
  memberSince: "2024-03-15",
};

// Default browse products - IDs match merchant database (prod_1, prod_2, etc.)
const DEFAULT_RECOMMENDATIONS: Product[] = [
  {
    id: "prod_1",
    sku: "TS-001",
    name: "Classic Tee",
    basePrice: 2500,
    stockCount: 100,
    variant: "Black",
    size: "Large",
    imageUrl: "/prod_1.jpeg",
  },
  {
    id: "prod_2",
    sku: "TS-002",
    name: "V-Neck Tee",
    basePrice: 2800,
    stockCount: 50,
    variant: "Natural",
    size: "Large",
    imageUrl: "/prod_2.jpeg",
  },
  {
    id: "prod_3",
    sku: "TS-003",
    name: "Graphic Tee",
    basePrice: 3200,
    stockCount: 200,
    variant: "Grey",
    size: "Large",
    imageUrl: "/prod_3.jpeg",
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
  const browseRecommendations: Product[] =
    (toolOutput?.recommendations as Product[]) ?? DEFAULT_RECOMMENDATIONS;

  // Page navigation state
  const [currentPage, setCurrentPage] = useState<WidgetPage>("browse");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productRecommendations, setProductRecommendations] = useState<Product[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

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

  // Navigate to product detail page
  const handleProductClick = useCallback(
    async (product: Product) => {
      setSelectedProduct(product);
      setCurrentPage("product_detail");
      setProductRecommendations([]);
      setIsLoadingRecommendations(true);

      try {
        // Request recommendations from parent via postMessage
        const message = {
          type: "GET_RECOMMENDATIONS",
          productId: product.id,
          productName: product.name,
          cartItems: cartItems.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.basePrice,
          })),
        };
        window.parent.postMessage(message, "*");
      } catch (error) {
        console.error("[Widget] Failed to request recommendations:", error);
        setIsLoadingRecommendations(false);
      }
    },
    [cartItems]
  );

  // Handle recommendations response from parent
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "RECOMMENDATIONS_RESULT") {
        console.log("[Widget] Received RECOMMENDATIONS_RESULT:", event.data);
        setIsLoadingRecommendations(false);
        if (event.data.recommendations && event.data.recommendations.length > 0) {
          console.log("[Widget] Processing", event.data.recommendations.length, "recommendations");
          // Convert recommendations from agent format to Product format
          // Now uses enriched data from MCP server (real prices, images from merchant API)
          type EnrichedRec = {
            productId?: string;
            product_id?: string;
            productName?: string;
            product_name?: string;
            price?: number;
            sku?: string;
            image_url?: string;
            stock_count?: number;
            rank: number;
          };
          const products: Product[] = event.data.recommendations.map(
            (rec: EnrichedRec) => ({
              id: rec.productId ?? rec.product_id ?? `prod_${Date.now()}`,
              sku: rec.sku ?? `SKU-${rec.productId ?? rec.product_id}`,
              name: rec.productName ?? rec.product_name ?? "Product",
              basePrice: rec.price ?? 2500,
              stockCount: rec.stock_count ?? 100,
              variant: "Default",
              size: "One Size",
              imageUrl: rec.image_url,
            })
          );
          console.log("[Widget] Mapped products:", products);
          setProductRecommendations(products);
        } else {
          console.log("[Widget] No recommendations in message or empty array");
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Navigate back to browse
  const handleBackToBrowse = useCallback(() => {
    setCurrentPage("browse");
    setSelectedProduct(null);
    setProductRecommendations([]);
  }, []);

  // Add to cart with quantity (for product detail page)
  const handleAddToCartWithQuantity = useCallback(
    (product: Product, quantity: number) => {
      setCartItems((prev) => {
        const existingItem = prev.find((item) => item.id === product.id);
        if (existingItem) {
          return prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            basePrice: product.basePrice,
            quantity,
            variant: product.variant,
            size: product.size,
          },
        ];
      });
    },
    []
  );

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
          status: "confirmed",
          orderId,
          message: "Order placed successfully!",
        });
        setCartItems([]);
      }
    } catch (error) {
      setCheckoutResult({
        success: false,
        status: "failed",
        error:
          error instanceof Error ? error.message : "Checkout failed",
      });
    } finally {
      setIsCheckingOut(false);
    }
  }, [cartItems, cartState]);

  // Render product detail page
  if (currentPage === "product_detail" && selectedProduct) {
    return (
      <div className="min-h-screen bg-surface transition-colors">
        <ProductDetailPage
          product={selectedProduct}
          recommendations={productRecommendations}
          isLoadingRecommendations={isLoadingRecommendations}
          onBack={handleBackToBrowse}
          onAddToCart={handleAddToCartWithQuantity}
          onProductClick={handleProductClick}
          onQuickAdd={handleAddToCart}
        />
      </div>
    );
  }

  // Render browse page
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
              products={browseRecommendations}
              onAddToCart={handleAddToCart}
              onProductClick={handleProductClick}
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
