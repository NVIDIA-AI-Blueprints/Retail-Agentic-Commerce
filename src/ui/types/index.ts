/**
 * Product type representing a t-shirt in the catalog
 */
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  basePrice: number; // in cents
  stockCount: number;
  minMargin: number;
  imageUrl: string;
  variant?: string;
  size?: string;
}

/**
 * Line item in a checkout session
 */
export interface LineItem {
  id: string;
  item: {
    id: string;
    name?: string;
    imageUrl?: string;
  };
  quantity: number;
  baseAmount: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Fulfillment option for shipping
 */
export interface FulfillmentOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDelivery: string;
}

/**
 * Payment provider information
 */
export interface PaymentProvider {
  provider: string;
  supportedPaymentMethods: string[];
}

/**
 * Checkout session status
 */
export type CheckoutStatus =
  | "not_ready_for_payment"
  | "ready_for_payment"
  | "completed"
  | "canceled";

/**
 * Full checkout session as per ACP spec
 */
export interface CheckoutSession {
  id: string;
  status: CheckoutStatus;
  currency: string;
  lineItems: LineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  fulfillmentOptions?: FulfillmentOption[];
  selectedFulfillmentOptionId?: string;
  paymentProvider?: PaymentProvider;
  createdAt: string;
  updatedAt: string;
}

/**
 * Chat message in the agent panel
 */
export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
}

/**
 * ACP request log entry
 */
export interface ACPRequest {
  id: string;
  method: string;
  endpoint: string;
  timestamp: string;
  status: number;
  payload?: unknown;
  response?: unknown;
}

/**
 * Checkout flow state machine states
 */
export type CheckoutFlowState = "product_selection" | "checkout" | "processing" | "confirmation";

/**
 * Checkout flow context containing all state
 */
export interface CheckoutFlowContext {
  state: CheckoutFlowState;
  selectedProduct: Product | null;
  quantity: number;
  selectedShippingId: string;
  orderId: string | null;
}

/**
 * Checkout flow actions for the state machine
 */
export type CheckoutFlowAction =
  | { type: "SELECT_PRODUCT"; product: Product }
  | { type: "UPDATE_QUANTITY"; quantity: number }
  | { type: "SELECT_SHIPPING"; shippingId: string }
  | { type: "SUBMIT_PAYMENT" }
  | { type: "PAYMENT_COMPLETE"; orderId: string }
  | { type: "RESET" };
