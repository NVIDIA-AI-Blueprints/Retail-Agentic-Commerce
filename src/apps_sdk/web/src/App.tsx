import { useState, useEffect, useCallback } from "react";
import { LoyaltyHeader } from "@/components/LoyaltyHeader";
import { RecommendationCarousel } from "@/components/RecommendationCarousel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProductDetailPage } from "@/components/ProductDetailPage";
import { CheckoutPage } from "@/components/CheckoutPage";
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
type WidgetPage = "browse" | "product_detail" | "checkout";

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
  
  // Checkout-specific recommendations
  const [checkoutRecommendations, setCheckoutRecommendations] = useState<Product[]>([]);
  const [isLoadingCheckoutRecommendations, setIsLoadingCheckoutRecommendations] = useState(false);

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

  // ACP session state
  const [sessionId, setSessionId] = useState<string | null>(null);

  // API base URL - relative in production, localhost in dev
  const getApiBaseUrl = useCallback(() => {
    const isViteDevServer = window.location.port === "3001" || window.location.port === "3002";
    return isViteDevServer ? "http://localhost:2091" : "";
  }, []);

  // Create or update ACP checkout session
  const syncCheckoutSession = useCallback(
    async (items: CartItem[], currentSessionId: string | null): Promise<string | null> => {
      if (items.length === 0) {
        // No items, no session needed
        return null;
      }

      const apiBaseUrl = getApiBaseUrl();
      const acpItems = items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      }));

      try {
        if (currentSessionId) {
          // Update existing session
          console.log("[Widget] Updating ACP session:", currentSessionId);
          const response = await fetch(`${apiBaseUrl}/acp/sessions/${currentSessionId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: currentSessionId,
              items: acpItems,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            return data.id || currentSessionId;
          } else {
            // Session might be invalid, create a new one
            console.warn("[Widget] Session update failed, creating new session");
          }
        }

        // Create new session
        console.log("[Widget] Creating new ACP session");
        const response = await fetch(`${apiBaseUrl}/acp/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: acpItems,
            buyer: {
              first_name: "John",
              last_name: "Doe",
              email: "john@example.com",
            },
            fulfillmentAddress: {
              name: "John Doe",
              line_one: "123 AI Boulevard",
              city: "San Francisco",
              state: "CA",
              postal_code: "94102",
              country: "US",
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("[Widget] ACP session created:", data.id);
          return data.id;
        }
      } catch (error) {
        console.warn("[Widget] Failed to sync ACP session:", error);
      }

      return currentSessionId;
    },
    [getApiBaseUrl]
  );

  // Notify server of cart updates via ACP
  const notifyCartUpdate = useCallback(
    async (items: CartItem[]) => {
      const newSessionId = await syncCheckoutSession(items, sessionId);
      if (newSessionId !== sessionId) {
        setSessionId(newSessionId);
      }
    },
    [sessionId, syncCheckoutSession]
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
      let newItems: CartItem[];
      if (existingItem) {
        newItems = prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [
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
      }
      // Notify server after state update
      notifyCartUpdate(newItems);
      return newItems;
    });
  }, [notifyCartUpdate]);

  // Update item quantity
  const handleUpdateQuantity = useCallback(
    (productId: string, quantity: number) => {
      setCartItems((prev) => {
        let newItems: CartItem[];
        if (quantity <= 0) {
          newItems = prev.filter((item) => item.id !== productId);
        } else {
          newItems = prev.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          );
        }
        // Notify server after state update
        notifyCartUpdate(newItems);
        return newItems;
      });
    },
    [notifyCartUpdate]
  );

  // Remove item from cart
  const handleRemoveItem = useCallback((productId: string) => {
    setCartItems((prev) => {
      const newItems = prev.filter((item) => item.id !== productId);
      notifyCartUpdate(newItems);
      return newItems;
    });
  }, [notifyCartUpdate]);

  // Clear cart and result
  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setCheckoutResult(null);
    notifyCartUpdate([]);
  }, [notifyCartUpdate]);

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
          source: "product_detail",
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
        const source = event.data.source || "product_detail";
        
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
        
        const products: Product[] = event.data.recommendations?.length > 0
          ? event.data.recommendations.map((rec: EnrichedRec) => ({
              id: rec.productId ?? rec.product_id ?? `prod_${Date.now()}`,
              sku: rec.sku ?? `SKU-${rec.productId ?? rec.product_id}`,
              name: rec.productName ?? rec.product_name ?? "Product",
              basePrice: rec.price ?? 2500,
              stockCount: rec.stock_count ?? 100,
              variant: "Default",
              size: "One Size",
              imageUrl: rec.image_url,
            }))
          : [];
        
        console.log(`[Widget] Mapped ${products.length} products for ${source}`);
        
        // Route to appropriate state based on source
        if (source === "checkout") {
          setIsLoadingCheckoutRecommendations(false);
          setCheckoutRecommendations(products);
        } else {
          setIsLoadingRecommendations(false);
          setProductRecommendations(products);
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

  // Navigate to checkout page and request recommendations based on cart
  const handleCartClick = useCallback(() => {
    setCurrentPage("checkout");
    
    // Request recommendations based on cart items
    if (cartItems.length > 0) {
      setCheckoutRecommendations([]);
      setIsLoadingCheckoutRecommendations(true);
      
      try {
        // Use first cart item as the "current product" context for recommendations
        const primaryItem = cartItems[0];
        const message = {
          type: "GET_RECOMMENDATIONS",
          source: "checkout",
          productId: primaryItem.id,
          productName: primaryItem.name,
          cartItems: cartItems.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.basePrice,
          })),
        };
        console.log("[Widget] Requesting checkout recommendations:", message);
        window.parent.postMessage(message, "*");
      } catch (error) {
        console.error("[Widget] Failed to request checkout recommendations:", error);
        setIsLoadingCheckoutRecommendations(false);
      }
    }
  }, [cartItems]);

  // Add to cart with quantity (for product detail page)
  const handleAddToCartWithQuantity = useCallback(
    (product: Product, quantity: number) => {
      setCartItems((prev) => {
        const existingItem = prev.find((item) => item.id === product.id);
        let newItems: CartItem[];
        if (existingItem) {
          newItems = prev.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [
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
        }
        // Notify server after state update
        notifyCartUpdate(newItems);
        return newItems;
      });
    },
    [notifyCartUpdate]
  );

  // Handle checkout - makes real API calls to the MCP server
  // Widget is fully isolated - no postMessage communication with parent
  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) return;

    setIsCheckingOut(true);
    setCheckoutResult(null);

    // Determine the API base URL
    // In production (served from MCP server), use relative URL
    // In development (Vite dev server), use localhost:2091
    const isViteDevServer = window.location.port === "3001" || window.location.port === "3002";
    const apiBaseUrl = isViteDevServer ? "http://localhost:2091" : "";
    const cartId = cartState.cartId || `cart_${Date.now().toString(36)}`;

    try {
      // Make real HTTP call to the MCP server's REST API
      // The MCP server handles the full ACP flow and emits SSE events
      // that the Protocol Inspector can subscribe to independently
      console.log("[Checkout] Calling checkout REST API...", { cartId, itemCount: cartItems.length });
      
      const response = await fetch(`${apiBaseUrl}/cart/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartId,
          cartItems: cartItems,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Checkout] API error:", response.status, errorText);
        throw new Error(`Checkout failed: ${response.status}`);
      }

      const result = await response.json() as CheckoutResult;
      console.log("[Checkout] API response:", result);
      
      setCheckoutResult(result);

      if (result.success) {
        setCartItems([]);
      }
    } catch (error) {
      console.error("[Checkout] Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Checkout failed - is the MCP server running?";
      setCheckoutResult({
        success: false,
        status: "failed",
        error: errorMessage,
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
          cartItemCount={cartState.itemCount}
          onBack={handleBackToBrowse}
          onAddToCart={handleAddToCartWithQuantity}
          onProductClick={handleProductClick}
          onQuickAdd={handleAddToCart}
          onCartClick={handleCartClick}
        />
      </div>
    );
  }

  // Render checkout page
  if (currentPage === "checkout") {
    // Use checkout recommendations if available, fall back to browse recommendations
    const displayRecommendations = checkoutRecommendations.length > 0 
      ? checkoutRecommendations 
      : browseRecommendations;
    
    return (
      <div className="min-h-screen bg-surface transition-colors">
        <CheckoutPage
          cartItems={cartItems}
          cartState={cartState}
          recommendations={displayRecommendations}
          isLoadingRecommendations={isLoadingCheckoutRecommendations}
          isProcessing={isCheckingOut}
          checkoutResult={checkoutResult}
          sessionId={sessionId}
          onBack={handleBackToBrowse}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
          onProductClick={handleProductClick}
          onQuickAdd={handleAddToCart}
          onClearResult={handleClearCart}
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

      {/* Loyalty Header with Cart Icon */}
      <LoyaltyHeader
        user={user}
        cartItemCount={cartState.itemCount}
        onCartClick={handleCartClick}
      />

      {/* Main Content - Only show recommendations */}
      <div className="px-5 pb-6">
        <RecommendationCarousel
          products={browseRecommendations}
          onAddToCart={handleAddToCart}
          onProductClick={handleProductClick}
        />
      </div>
    </div>
  );
}
