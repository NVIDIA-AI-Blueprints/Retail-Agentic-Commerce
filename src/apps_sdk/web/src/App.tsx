import { useState, useEffect, useCallback } from "react";
import { SearchX } from "lucide-react";
import { LoyaltyHeader } from "@/components/LoyaltyHeader";
import { RecommendationCarousel } from "@/components/RecommendationCarousel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProductDetailPage } from "@/components/ProductDetailPage";
import { CheckoutPage } from "@/components/CheckoutPage";
import { useToolOutput, useWidgetState } from "@/hooks";
import type {
  Product,
  MerchantUser,
  CartItem,
  CartState,
  CheckoutResult,
  ACPSessionResponse,
} from "@/types";
import { cartStateFromSession, EMPTY_CART_STATE } from "@/types";
import {
  DEFAULT_FULFILLMENT_ADDRESS,
  syncCheckoutSessionWithDefaultShipping,
} from "@/checkout-session-sync";

/**
 * Widget page state for navigation
 */
type WidgetPage = "browse" | "product_detail" | "checkout";

/**
 * State that persists across widget remounts via useWidgetState.
 * Only includes what needs to survive — transient UI state stays in useState.
 */
interface PersistedWidgetState {
  cartItems: CartItem[];
  sessionId: string | null;
  currentPage: WidgetPage;
  selectedProductId: string | null;
  [key: string]: unknown;
}

const DEFAULT_PERSISTED_STATE: PersistedWidgetState = {
  cartItems: [],
  sessionId: null,
  currentPage: "browse",
  selectedProductId: null,
};

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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map raw recommendation agent output to Product[] for display.
 * Shared by both product-detail and checkout recommendation flows.
 */
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

function mapRecommendationsToProducts(
  recommendations: EnrichedRec[],
  recommendationRequestId: string | undefined,
  source: string
): Product[] {
  if (!recommendations || recommendations.length === 0) return [];
  return recommendations.map((rec, index) => ({
    id: rec.productId ?? rec.product_id ?? `prod_${Date.now()}`,
    sku: rec.sku ?? `SKU-${rec.productId ?? rec.product_id}`,
    name: rec.productName ?? rec.product_name ?? "Product",
    basePrice: rec.price ?? 2500,
    stockCount: rec.stock_count ?? 100,
    variant: "Default",
    size: "One Size",
    imageUrl: rec.image_url,
    recommendationRequestId,
    recommendationPosition: typeof rec.rank === "number" ? rec.rank : index + 1,
    recommendationSource: source,
  }));
}

/**
 * Call window.openai.callTool and parse the JSON result.
 * In production the real host provides this; in dev the simulated bridge
 * routes to the MCP server via JSON-RPC (see main.tsx).
 */
async function callTool<T = Record<string, unknown>>(
  name: string,
  args: Record<string, unknown>
): Promise<T> {
  if (!window.openai?.callTool) {
    throw new Error("window.openai.callTool not available");
  }
  const response = await window.openai.callTool(name, args);
  try {
    return JSON.parse(response.result) as T;
  } catch {
    throw new Error(`Failed to parse ${name} response: ${response.result.slice(0, 200)}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main App Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main App Component
 *
 * The merchant widget app that provides a full shopping experience.
 * All communication with the MCP server goes through window.openai.callTool().
 * Supports light/dark mode theming via @openai/apps-sdk-ui.
 */
export function App() {
  // Get data from window.openai if available
  const toolOutput = useToolOutput();

  // User and recommendations from toolOutput or defaults
  const user: MerchantUser = (toolOutput?.user as MerchantUser) ?? DEFAULT_USER;
  const toolError =
    toolOutput && typeof toolOutput.error === "string" ? (toolOutput.error as string) : null;
  const browseRecommendations: Product[] = toolOutput
    ? toolError
      ? []
      : ((toolOutput?.products as Product[]) ??
        (toolOutput?.recommendations as Product[]) ??
        [])
    : DEFAULT_RECOMMENDATIONS;
  const showEmptyState = browseRecommendations.length === 0;
  const emptyStateMessage =
    toolError ?? "No products found. Try a different search or browse trending items.";

  // ── Persisted state (survives widget remount) ──────────────────────────
  const [persisted, setPersisted] = useWidgetState<PersistedWidgetState>(DEFAULT_PERSISTED_STATE);

  // Convenience updaters that merge into persisted state
  const updateCartItems = useCallback(
    (items: CartItem[]) => setPersisted((prev) => ({ ...prev, cartItems: items })),
    [setPersisted]
  );
  const updateSessionId = useCallback(
    (id: string | null) => setPersisted((prev) => ({ ...prev, sessionId: id })),
    [setPersisted]
  );
  const updateCurrentPage = useCallback(
    (page: WidgetPage, productId?: string | null) =>
      setPersisted((prev) => ({
        ...prev,
        currentPage: page,
        selectedProductId: productId !== undefined ? productId : prev.selectedProductId,
      })),
    [setPersisted]
  );

  // Derive frequently used values
  const cartItems = persisted.cartItems;
  const sessionId = persisted.sessionId;
  const currentPage = persisted.currentPage;

  // ── Transient state (OK to lose on remount) ────────────────────────────
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productRecommendations, setProductRecommendations] = useState<Product[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [checkoutRecommendations, setCheckoutRecommendations] = useState<Product[]>([]);
  const [isLoadingCheckoutRecommendations, setIsLoadingCheckoutRecommendations] = useState(false);
  const [cartState, setCartState] = useState<CartState>(EMPTY_CART_STATE);
  const [isPendingCartUpdate, setIsPendingCartUpdate] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);
  const [acpSession, setAcpSession] = useState<ACPSessionResponse | null>(null);

  // ── Re-sync ACP session on mount if persisted cart is non-empty ─────────
  useEffect(() => {
    let mounted = true;
    if (cartItems.length > 0 && !acpSession) {
      void (async () => {
        setIsPendingCartUpdate(true);
        try {
          const { sessionId: newSid, sessionData } = await syncCheckoutSession(
            cartItems,
            sessionId
          );
          if (!mounted) return;
          if (newSid !== sessionId) updateSessionId(newSid);
          if (sessionData) setAcpSession(sessionData);
        } finally {
          if (mounted) setIsPendingCartUpdate(false);
        }
      })();
    }
    return () => { mounted = false; };
    // Only run once on mount — intentionally omitting deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Track recommendation click via callTool ─────────────────────────────
  const trackRecommendationClick = useCallback(
    async (product: Product) => {
      if (!product.recommendationRequestId) return;
      try {
        await callTool("track-recommendation-click", {
          productId: product.id,
          recommendationRequestId: product.recommendationRequestId,
          sessionId: cartState.cartId || sessionId || undefined,
          position: product.recommendationPosition,
          source: product.recommendationSource ?? "apps_sdk_widget",
        });
      } catch (error) {
        console.warn("[Widget] Failed to track recommendation click:", error);
      }
    },
    [cartState.cartId, sessionId]
  );

  // ── ACP session management via callTool ─────────────────────────────────
  const syncCheckoutSession = useCallback(
    async (
      items: CartItem[],
      currentSessionId: string | null
    ): Promise<{ sessionId: string | null; sessionData: ACPSessionResponse | null }> => {
      const result = await syncCheckoutSessionWithDefaultShipping({
        items,
        currentSessionId,
        callTool,
      });

      if (currentSessionId && result.sessionId === currentSessionId) {
        console.log("[Widget] ACP session updated:", currentSessionId);
      } else if (result.sessionId) {
        console.log("[Widget] ACP session created:", result.sessionId);
      }

      if (result.sessionData) {
        console.log(
          "[Widget] Promotion data:",
          result.sessionData.line_items?.map((lineItem) => lineItem.promotion)
        );
      }

      return result;
    },
    []
  );

  // Notify server of cart updates via ACP
  const notifyCartUpdate = useCallback(
    async (items: CartItem[]) => {
      setIsPendingCartUpdate(true);
      try {
        const { sessionId: newSessionId, sessionData } = await syncCheckoutSession(items, sessionId);
        if (newSessionId !== sessionId) {
          updateSessionId(newSessionId);
        }
        if (sessionData) {
          setAcpSession(sessionData);
        }
      } finally {
        setIsPendingCartUpdate(false);
      }
    },
    [sessionId, syncCheckoutSession, updateSessionId]
  );

  // ── Shipping update via callTool ────────────────────────────────────────
  const handleShippingUpdate = useCallback(
    async (fulfillmentOptionId: string) => {
      if (!sessionId) {
        console.warn("[Widget] No session ID for shipping update");
        return;
      }
      try {
        console.log("[Widget] Updating shipping to:", fulfillmentOptionId);
        const data = await callTool<ACPSessionResponse>("update-checkout-session", {
          sessionId,
          fulfillmentOptionId,
          fulfillmentAddress: DEFAULT_FULFILLMENT_ADDRESS,
        });
        console.log("[Widget] Shipping updated, new totals:", data.totals);
        setAcpSession(data);
      } catch (error) {
        console.error("[Widget] Failed to update shipping:", error);
        throw error;
      }
    },
    [sessionId]
  );

  // ── Coupon via callTool ─────────────────────────────────────────────────
  const handleApplyCoupon = useCallback(
    async (couponCode: string) => {
      if (!sessionId) {
        console.warn("[Widget] No session ID for coupon update");
        return;
      }
      const normalized = couponCode.trim().toUpperCase();
      try {
        const data = await callTool<ACPSessionResponse>("update-checkout-session", {
          sessionId,
          discounts: { codes: normalized ? [normalized] : [] },
        });
        setAcpSession(data);
      } catch (error) {
        console.error("[Widget] Failed to update coupon:", error);
        throw error;
      }
    },
    [sessionId]
  );

  // ── Derive cart state from ACP session ──────────────────────────────────
  useEffect(() => {
    const newCartState = cartStateFromSession(acpSession, cartItems, sessionId ?? "");
    if (isPendingCartUpdate) {
      newCartState.isCalculating = true;
    }
    setCartState(newCartState);
  }, [acpSession, cartItems, sessionId, isPendingCartUpdate]);

  // ── Cart operations ─────────────────────────────────────────────────────
  const handleAddToCart = useCallback(
    (product: Product) => {
      void trackRecommendationClick(product);
      const existingItem = cartItems.find((item) => item.id === product.id);
      let newItems: CartItem[];
      if (existingItem) {
        newItems = cartItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                recommendationRequestId:
                  item.recommendationRequestId ?? product.recommendationRequestId,
                recommendationPosition:
                  item.recommendationPosition ?? product.recommendationPosition,
                recommendationSource:
                  item.recommendationSource ?? product.recommendationSource,
              }
            : item
        );
      } else {
        newItems = [
          ...cartItems,
          {
            id: product.id,
            name: product.name,
            basePrice: product.basePrice,
            quantity: 1,
            variant: product.variant,
            size: product.size,
            recommendationRequestId: product.recommendationRequestId,
            recommendationPosition: product.recommendationPosition,
            recommendationSource: product.recommendationSource,
          },
        ];
      }
      updateCartItems(newItems);
      notifyCartUpdate(newItems);
    },
    [cartItems, notifyCartUpdate, trackRecommendationClick, updateCartItems]
  );

  const handleUpdateQuantity = useCallback(
    (productId: string, quantity: number) => {
      let newItems: CartItem[];
      if (quantity <= 0) {
        newItems = cartItems.filter((item) => item.id !== productId);
      } else {
        newItems = cartItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        );
      }
      updateCartItems(newItems);
      notifyCartUpdate(newItems);
    },
    [cartItems, notifyCartUpdate, updateCartItems]
  );

  const handleRemoveItem = useCallback(
    (productId: string) => {
      const newItems = cartItems.filter((item) => item.id !== productId);
      updateCartItems(newItems);
      notifyCartUpdate(newItems);
    },
    [cartItems, notifyCartUpdate, updateCartItems]
  );

  const handleClearCart = useCallback(() => {
    updateCartItems([]);
    setCheckoutResult(null);
    notifyCartUpdate([]);
  }, [notifyCartUpdate, updateCartItems]);

  // ── Fetch recommendations via callTool ──────────────────────────────────
  const fetchRecommendations = useCallback(
    async (
      productId: string,
      productName: string,
      source: string
    ) => {
      try {
        const result = await callTool<{
          recommendations?: EnrichedRec[];
          recommendationRequestId?: string;
        }>("get-recommendations", {
          productId,
          productName,
          cartItems: cartItems.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.basePrice,
          })),
          sessionId: cartState.cartId || sessionId || undefined,
        });

        const recRequestId =
          typeof result.recommendationRequestId === "string"
            ? result.recommendationRequestId
            : undefined;
        return mapRecommendationsToProducts(
          result.recommendations ?? [],
          recRequestId,
          source
        );
      } catch (error) {
        console.error("[Widget] Failed to get recommendations:", error);
        return [];
      }
    },
    [cartItems, cartState.cartId, sessionId]
  );

  // Navigate to product detail page
  const handleProductClick = useCallback(
    async (product: Product) => {
      void trackRecommendationClick(product);
      setSelectedProduct(product);
      updateCurrentPage("product_detail", product.id);
      setProductRecommendations([]);
      setIsLoadingRecommendations(true);

      const products = await fetchRecommendations(product.id, product.name, "product_detail");
      setProductRecommendations(products);
      setIsLoadingRecommendations(false);
    },
    [trackRecommendationClick, updateCurrentPage, fetchRecommendations]
  );

  // Navigate back to browse
  const handleBackToBrowse = useCallback(() => {
    updateCurrentPage("browse", null);
    setSelectedProduct(null);
    setProductRecommendations([]);
  }, [updateCurrentPage]);

  // Navigate to checkout page and request recommendations based on cart
  const handleCartClick = useCallback(() => {
    updateCurrentPage("checkout");

    if (cartItems.length > 0) {
      setCheckoutRecommendations([]);
      setIsLoadingCheckoutRecommendations(true);

      const primaryItem = cartItems[0];
      console.log("[Widget] Requesting checkout recommendations for:", primaryItem.name);

      void (async () => {
        const products = await fetchRecommendations(primaryItem.id, primaryItem.name, "checkout");
        setCheckoutRecommendations(products);
        setIsLoadingCheckoutRecommendations(false);
      })();
    }
  }, [cartItems, updateCurrentPage, fetchRecommendations]);

  // Add to cart with quantity (for product detail page)
  const handleAddToCartWithQuantity = useCallback(
    (product: Product, quantity: number) => {
      void trackRecommendationClick(product);
      const existingItem = cartItems.find((item) => item.id === product.id);
      let newItems: CartItem[];
      if (existingItem) {
        newItems = cartItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                recommendationRequestId:
                  item.recommendationRequestId ?? product.recommendationRequestId,
                recommendationPosition:
                  item.recommendationPosition ?? product.recommendationPosition,
                recommendationSource:
                  item.recommendationSource ?? product.recommendationSource,
              }
            : item
        );
      } else {
        newItems = [
          ...cartItems,
          {
            id: product.id,
            name: product.name,
            basePrice: product.basePrice,
            quantity,
            variant: product.variant,
            size: product.size,
            recommendationRequestId: product.recommendationRequestId,
            recommendationPosition: product.recommendationPosition,
            recommendationSource: product.recommendationSource,
          },
        ];
      }
      updateCartItems(newItems);
      notifyCartUpdate(newItems);
    },
    [cartItems, notifyCartUpdate, trackRecommendationClick, updateCartItems]
  );

  // ── Checkout via callTool ───────────────────────────────────────────────
  const handleCheckout = useCallback(
    async (paymentFormData?: {
      fullName: string;
      address: string;
      city: string;
      zipCode: string;
    }) => {
      if (cartItems.length === 0) return;

      setIsCheckingOut(true);
      setCheckoutResult(null);

      const cartId = cartState.cartId || `cart_${Date.now().toString(36)}`;
      const customerName = paymentFormData?.fullName || "Customer";

      try {
        console.log("[Checkout] Calling checkout via callTool...", {
          cartId,
          itemCount: cartItems.length,
          customerName,
        });

        const result = await callTool<CheckoutResult>("checkout", {
          cartId,
          cartItems: cartItems,
          customerName,
        });

        console.log("[Checkout] callTool response:", result);
        setCheckoutResult(result);

        if (result.success) {
          updateCartItems([]);
          updateSessionId(null);
          setAcpSession(null);
        }
      } catch (error) {
        console.error("[Checkout] Error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Checkout failed - is the MCP server running?";
        setCheckoutResult({
          success: false,
          status: "failed",
          error: errorMessage,
        });
      } finally {
        setIsCheckingOut(false);
      }
    },
    [cartItems, cartState, updateCartItems, updateSessionId]
  );

  // ── Render ──────────────────────────────────────────────────────────────

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
    const displayRecommendations =
      checkoutRecommendations.length > 0
        ? checkoutRecommendations
        : browseRecommendations;

    return (
      <div className="min-h-screen bg-surface transition-colors">
        <CheckoutPage
          cartItems={cartItems}
          cartState={cartState}
          sessionData={acpSession}
          recommendations={displayRecommendations}
          isLoadingRecommendations={isLoadingCheckoutRecommendations}
          isProcessing={isCheckingOut}
          checkoutResult={checkoutResult}
          onBack={handleBackToBrowse}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
          onProductClick={handleProductClick}
          onQuickAdd={handleAddToCart}
          onClearResult={handleClearCart}
          onShippingUpdate={handleShippingUpdate}
          onApplyCoupon={handleApplyCoupon}
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
        {toolError && (
          <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {toolError}
          </div>
        )}
        {showEmptyState ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-default/60 bg-surface-elevated/50 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-default/60 bg-surface-elevated">
              <SearchX className="h-6 w-6 text-text-secondary" strokeWidth={1.75} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text">No products found</p>
              <p className="text-xs text-text-secondary">{emptyStateMessage}</p>
            </div>
          </div>
        ) : (
          <RecommendationCarousel
            products={browseRecommendations}
            onAddToCart={handleAddToCart}
            onProductClick={handleProductClick}
          />
        )}
      </div>
    </div>
  );
}
