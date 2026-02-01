/**
 * Types for the ACP Merchant Widget
 */

// =============================================================================
// Product Types
// =============================================================================

export interface Product {
  id: string;
  sku: string;
  name: string;
  basePrice: number;
  stockCount: number;
  variant?: string;
  size?: string;
  imageUrl?: string;
}

// =============================================================================
// User & Loyalty Types
// =============================================================================

export type LoyaltyTier = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface MerchantUser {
  id: string;
  name: string;
  email: string;
  loyaltyPoints: number;
  tier: LoyaltyTier;
  memberSince?: string;
}

// =============================================================================
// Cart Types
// =============================================================================

export interface CartItem {
  id: string;
  name: string;
  basePrice: number;
  quantity: number;
  variant?: string;
  size?: string;
  imageUrl?: string;
}

/**
 * Cart state - totals should come from backend ACP session
 * Frontend should not calculate these values
 */
export interface CartState {
  cartId: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discount: number;
  /** True when waiting for backend to return calculated totals */
  isCalculating: boolean;
}

/**
 * Empty cart state - used for initialization
 */
export const EMPTY_CART_STATE: CartState = {
  cartId: "",
  items: [],
  itemCount: 0,
  subtotal: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  discount: 0,
  isCalculating: false,
};

// Note: All fee calculations happen on the backend.
// No frontend constants needed - shipping rates come from merchant API.

// =============================================================================
// Widget State Types
// =============================================================================

export type WidgetView = "browse" | "cart" | "checkout" | "confirmation";

export interface WidgetState {
  view: WidgetView;
  cart: CartState;
  selectedProductId: string | null;
  checkoutResult: CheckoutResult | null;
}

export type CheckoutStatus = "confirmed" | "failed" | "pending";

export interface CheckoutResult {
  success: boolean;
  status: CheckoutStatus;
  orderId?: string;
  message?: string;
  error?: string;
  total?: number;
  itemCount?: number;
  orderUrl?: string;
}

// =============================================================================
// ACP Session Types (Promotion Agent Integration)
// =============================================================================

/**
 * Promotion metadata from the Promotion Agent
 */
export interface PromotionMetadata {
  action: string; // e.g., "DISCOUNT_10_PCT", "NO_PROMO", "FREE_SHIPPING"
  reason_codes: string[]; // e.g., ["HIGH_INVENTORY", "ABOVE_MARKET"]
  reasoning: string; // LLM reasoning for the decision
}

/**
 * ACP Line Item with promotion data
 * Matches backend LineItem schema from merchant API
 */
export interface ACPLineItem {
  id: string;
  item: {
    id: string;
    quantity: number;
  };
  name?: string; // Product name (optional in backend)
  base_amount: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  promotion?: PromotionMetadata;
}

/**
 * ACP Total entry
 */
export interface ACPTotal {
  type: string;
  display_text: string;
  amount: number;
}

/**
 * ACP Session response from the Merchant API
 */
export interface ACPSessionResponse {
  id: string;
  status: string;
  currency: string;
  line_items: ACPLineItem[];
  totals: ACPTotal[];
  // Other fields we don't need for promotion display
}

// =============================================================================
// window.openai Types
// =============================================================================

export type DisplayMode = "pip" | "inline" | "fullscreen";
export type Theme = "light" | "dark";

export interface ToolOutput {
  recommendations?: Product[];
  user?: MerchantUser;
  theme?: Theme;
  locale?: string;
  [key: string]: unknown;
}

export interface OpenAiGlobals {
  // Read-only properties
  theme: Theme;
  locale: string;
  maxHeight: number;
  displayMode: DisplayMode;
  toolInput: Record<string, unknown>;
  toolOutput: ToolOutput | null;
  widgetState: WidgetState | null;

  // Methods
  setWidgetState: (state: unknown) => Promise<void>;
  callTool: (
    name: string,
    args: Record<string, unknown>
  ) => Promise<{ result: string }>;
  sendFollowUpMessage: (args: { prompt: string }) => Promise<void>;
  openExternal: (payload: { href: string }) => void;
  requestDisplayMode: (args: {
    mode: DisplayMode;
  }) => Promise<{ mode: DisplayMode }>;
  requestModal: (args: {
    title?: string;
    template?: string;
    params?: unknown;
  }) => Promise<unknown>;
  requestClose: () => Promise<void>;
}

// Extend Window interface
declare global {
  interface Window {
    openai?: OpenAiGlobals;
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format price in cents to display string
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Create cart state from ACP session response
 * All totals come from backend - no local calculations
 */
export function cartStateFromSession(
  session: ACPSessionResponse | null,
  items: CartItem[],
  cartId: string = ""
): CartState {
  if (!session) {
    // No session yet - return items with zero totals, mark as calculating
    return {
      cartId,
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      discount: 0,
      isCalculating: items.length > 0, // Calculating if we have items but no session
    };
  }

  // Extract totals from ACP session
  // Backend uses these total types:
  // - items_base_amount: Original item prices before discounts
  // - items_discount: Total discount amount  
  // - subtotal: Items after discounts
  // - tax: Tax amount
  // - fulfillment: Shipping cost (called "fulfillment" in backend)
  // - total: Grand total
  const findTotal = (type: string): number =>
    session.totals?.find((t) => t.type === type)?.amount ?? 0;

  // Get all totals from backend - NO frontend calculations
  const itemsBase = findTotal("items_base_amount");
  const subtotalAfterDiscount = findTotal("subtotal");
  const tax = findTotal("tax");
  const shipping = findTotal("fulfillment");
  const total = findTotal("total");

  // Calculate discount from line items (sum of individual discounts)
  const discount = session.line_items?.reduce(
    (sum, li) => sum + (li.discount || 0),
    0
  ) ?? 0;

  return {
    cartId: session.id || cartId,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    // Display items_base_amount as subtotal (before discounts) for transparency
    subtotal: itemsBase > 0 ? itemsBase : subtotalAfterDiscount,
    shipping,
    tax,
    // Use backend total directly - never calculate on frontend
    total,
    discount,
    isCalculating: false,
  };
}

/**
 * @deprecated Use cartStateFromSession instead - totals should come from backend
 * This function is kept only for backwards compatibility during migration
 */
export function calculateCartTotals(
  cartId: string,
  items: CartItem[]
): CartState {
  // Return state with isCalculating=true to indicate backend should be called
  return {
    cartId,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    discount: 0,
    isCalculating: true, // Signal that we need backend data
  };
}

/**
 * Get the base path for widget assets based on deployment context.
 * Supports three deployment modes:
 * 1. Vite dev server (localhost:3001/3002): Root path "/"
 * 2. Apps SDK server direct (localhost:2091): "/widget/"
 * 3. Docker via nginx (/apps-sdk/ path): "/apps-sdk/widget/"
 */
export function getWidgetAssetBasePath(): string {
  const isViteDevServer = window.location.port === "3001" || window.location.port === "3002";
  const isAppsSdkPath = window.location.pathname.startsWith("/apps-sdk/");

  if (isViteDevServer) {
    // Local Vite dev server - images served from root
    return "";
  } else if (isAppsSdkPath) {
    // Docker via nginx - images under /apps-sdk/widget/
    return "/apps-sdk/widget";
  } else {
    // Direct Apps SDK server (localhost:2091) - images under /widget/
    return "/widget";
  }
}

/**
 * Get product image URL based on product ID
 * Images are named after product IDs: prod_1.jpeg, prod_2.jpeg, etc.
 * Automatically detects deployment context (local dev, direct, or Docker via nginx).
 */
export function getProductImage(productId?: string): string {
  const basePath = getWidgetAssetBasePath();

  if (productId && productId.startsWith("prod_")) {
    return `${basePath}/${productId}.jpeg`;
  }
  // Fallback to first product image
  return `${basePath}/prod_1.jpeg`;
}
