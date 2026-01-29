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

export interface CartState {
  cartId: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

// Fee constants
export const CART_FEES = {
  SHIPPING_STANDARD: 500, // $5.00 in cents
  TAX_RATE: 0.0875, // 8.75%
} as const;

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
 * Calculate cart totals from items
 */
export function calculateCartTotals(
  cartId: string,
  items: CartItem[]
): CartState {
  const subtotal = items.reduce(
    (sum, item) => sum + item.basePrice * item.quantity,
    0
  );
  const shipping = items.length > 0 ? CART_FEES.SHIPPING_STANDARD : 0;
  const tax = Math.round(subtotal * CART_FEES.TAX_RATE);
  const total = subtotal + shipping + tax;

  return {
    cartId,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    shipping,
    tax,
    total,
  };
}

/**
 * Get product image URL based on product ID
 * Images are named after product IDs: prod_1.jpeg, prod_2.jpeg, etc.
 * In production, images are served from /widget/ path by the Apps SDK server.
 * In development (Vite dev server), images are served from root path.
 */
export function getProductImage(productId?: string): string {
  // Detect if running in production (served from Apps SDK server)
  // vs development (Vite dev server on localhost:3001)
  const isViteDevServer = window.location.port === "3001" || window.location.port === "3002";
  const basePath = isViteDevServer ? "" : "/widget";

  if (productId && productId.startsWith("prod_")) {
    return `${basePath}/${productId}.jpeg`;
  }
  // Fallback to first product image
  return `${basePath}/prod_1.jpeg`;
}
