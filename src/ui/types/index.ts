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

// =============================================================================
// ACP Line Items
// =============================================================================

/**
 * Item reference in line items
 */
export interface Item {
  id: string;
  quantity: number;
}

/**
 * Promotion metadata from the Promotion Agent
 */
export interface PromotionMetadata {
  action: string; // e.g., "DISCOUNT_10_PCT", "NO_PROMO"
  reason_codes: string[]; // e.g., ["HIGH_INVENTORY", "ABOVE_MARKET"]
  reasoning: string; // LLM explanation of the decision
}

/**
 * Line item in a checkout session
 */
export interface LineItem {
  id: string;
  item: Item;
  name?: string;
  description?: string;
  images?: string[];
  unit_amount?: number;
  base_amount: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
  promotion?: PromotionMetadata;
}

// =============================================================================
// Fulfillment
// =============================================================================

/**
 * Shipping fulfillment option (ACP-compliant)
 */
export interface ShippingFulfillmentOption {
  type: "shipping";
  id: string;
  title: string;
  subtitle: string;
  carrier_info?: string;
  earliest_delivery_time?: string;
  latest_delivery_time?: string;
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Digital fulfillment option
 */
export interface DigitalFulfillmentOption {
  type: "digital";
  id: string;
  title: string;
  subtitle?: string;
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Union type for fulfillment options
 */
export type FulfillmentOption = ShippingFulfillmentOption | DigitalFulfillmentOption;

/**
 * Legacy fulfillment option format (for backwards compatibility)
 */
export interface LegacyFulfillmentOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDelivery: string;
}

/**
 * Selected fulfillment option
 */
export interface SelectedFulfillmentOption {
  type: "shipping" | "digital";
  shipping?: {
    option_id: string;
    item_ids: string[];
  };
  digital?: {
    option_id: string;
    item_ids: string[];
  };
}

// =============================================================================
// Address
// =============================================================================

/**
 * Address for fulfillment or billing
 */
export interface Address {
  name: string;
  line_one: string;
  line_two?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone_number?: string;
}

/**
 * Fulfillment details with nested address
 */
export interface FulfillmentDetails {
  name?: string;
  phone_number?: string;
  email?: string;
  address: Address;
}

// =============================================================================
// Payment Provider & Capabilities
// =============================================================================

/**
 * Supported card networks
 */
export type CardNetwork = "visa" | "mastercard" | "amex" | "discover";

/**
 * Payment method with card networks
 */
export interface PaymentMethod {
  type: "card";
  supported_card_networks: CardNetwork[];
}

/**
 * Payment provider configuration (ACP-compliant)
 */
export interface PaymentProvider {
  provider: "stripe" | "adyen";
  supported_payment_methods: PaymentMethod[];
}

/**
 * Seller payment method capability
 */
export interface SellerPaymentMethod {
  method: string;
  brands?: string[];
  funding_types?: ("credit" | "debit" | "prepaid")[];
}

/**
 * Seller intervention capabilities
 */
export interface SellerInterventions {
  required: string[];
  supported: string[];
  enforcement?: "always" | "conditional" | "optional";
}

/**
 * Seller capabilities (ACP-compliant)
 */
export interface SellerCapabilities {
  payment_methods: (SellerPaymentMethod | string)[];
  interventions: SellerInterventions;
  features?: {
    partial_auth?: boolean;
    saved_payment_methods?: boolean;
    network_tokenization?: boolean;
  };
}

/**
 * Agent intervention capabilities
 */
export interface AgentInterventions {
  supported: string[];
  max_redirects?: number;
  redirect_context?: "in_app" | "external_browser" | "none";
  max_interaction_depth?: number;
  display_context?: "native" | "webview" | "modal" | "redirect";
}

/**
 * Agent capabilities for session creation
 */
export interface AgentCapabilities {
  interventions?: AgentInterventions;
  features?: {
    async_completion?: boolean;
    session_persistence?: boolean;
  };
}

// =============================================================================
// Totals & Messages
// =============================================================================

/**
 * Total type enum
 */
export type TotalType =
  | "items_base_amount"
  | "items_discount"
  | "subtotal"
  | "discount"
  | "fulfillment"
  | "tax"
  | "fee"
  | "total";

/**
 * Total line in checkout summary
 */
export interface Total {
  type: TotalType;
  display_text: string;
  amount: number;
  description?: string;
}

/**
 * Message types
 */
export type MessageType = "info" | "error";

/**
 * Error codes
 */
export type ErrorCode =
  | "missing"
  | "invalid"
  | "out_of_stock"
  | "payment_declined"
  | "requires_sign_in"
  | "requires_3ds";

/**
 * Info message
 */
export interface InfoMessage {
  type: "info";
  param?: string;
  content_type: "plain" | "markdown";
  content: string;
}

/**
 * Error message
 */
export interface ErrorMessage {
  type: "error";
  code: ErrorCode;
  param?: string;
  content_type: "plain" | "markdown";
  content: string;
}

/**
 * Union type for messages
 */
export type Message = InfoMessage | ErrorMessage;

/**
 * Link types
 */
export type LinkType = "terms_of_use" | "privacy_policy" | "return_policy";

/**
 * HATEOAS link
 */
export interface Link {
  type: LinkType;
  url: string;
}

// =============================================================================
// Authentication (3DS)
// =============================================================================

/**
 * Authentication outcome values
 */
export type AuthenticationOutcome = "authenticated" | "denied" | "canceled" | "processing_error";

/**
 * Authentication outcome details (3DS)
 */
export interface AuthenticationOutcomeDetails {
  three_ds_cryptogram: string;
  electronic_commerce_indicator: string;
  transaction_id: string;
  version: string;
}

/**
 * Authentication result for completing 3DS flow
 */
export interface AuthenticationResult {
  outcome: AuthenticationOutcome;
  outcome_details?: AuthenticationOutcomeDetails;
}

/**
 * Authentication metadata for 3DS challenge
 */
export interface AuthenticationMetadata {
  channel?: {
    type: "browser" | "app";
    browser?: {
      accept_header?: string;
      ip_address?: string;
      javascript_enabled?: boolean;
      language?: string;
      user_agent?: string;
      color_depth?: number;
      screen_height?: number;
      screen_width?: number;
      timezone_offset?: number;
    };
  };
  acquirer_details?: {
    acquirer_bin?: string;
    acquirer_country?: string;
    acquirer_merchant_id?: string;
    merchant_name?: string;
  };
  directory_server?: string;
  flow_preference?: {
    type: string;
    challenge?: { type: string };
  };
  redirect_url?: string;
}

// =============================================================================
// Order
// =============================================================================

/**
 * Order created after checkout completion
 */
export interface Order {
  id: string;
  checkout_session_id: string;
  permalink_url: string;
}

// =============================================================================
// Buyer
// =============================================================================

/**
 * Buyer information
 */
export interface Buyer {
  first_name: string;
  last_name?: string;
  email: string;
  phone_number?: string;
}

// =============================================================================
// Checkout Session Status
// =============================================================================

/**
 * Checkout session status (ACP-compliant)
 */
export type CheckoutStatus =
  | "not_ready_for_payment"
  | "ready_for_payment"
  | "authentication_required"
  | "in_progress"
  | "completed"
  | "canceled";

// =============================================================================
// Checkout Session Response
// =============================================================================

/**
 * Full checkout session response (ACP-compliant)
 */
export interface CheckoutSessionResponse {
  id: string;
  status: CheckoutStatus;
  currency: string;
  buyer?: Buyer;
  payment_provider: PaymentProvider;
  seller_capabilities?: SellerCapabilities;
  line_items: LineItem[];
  fulfillment_details?: FulfillmentDetails;
  fulfillment_options: FulfillmentOption[];
  selected_fulfillment_options?: SelectedFulfillmentOption[];
  fulfillment_option_id?: string;
  totals: Total[];
  messages: Message[];
  links: Link[];
  authentication_metadata?: AuthenticationMetadata;
  order?: Order;
}

/**
 * Legacy checkout session format (for backwards compatibility)
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
  fulfillmentOptions?: LegacyFulfillmentOption[];
  selectedFulfillmentOptionId?: string;
  paymentProvider?: {
    provider: string;
    supportedPaymentMethods: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// API Request Types
// =============================================================================

/**
 * Item input for checkout requests
 */
export interface ItemInput {
  id: string;
  quantity: number;
}

/**
 * Create checkout session request
 */
export interface CreateCheckoutRequest {
  items: ItemInput[];
  buyer?: Buyer;
  fulfillment_address?: Address;
}

/**
 * Update checkout session request
 */
export interface UpdateCheckoutRequest {
  items?: ItemInput[];
  buyer?: Buyer;
  fulfillment_address?: Address;
  fulfillment_option_id?: string;
}

/**
 * Payment data for completing checkout
 */
export interface PaymentData {
  token: string;
  provider: "stripe" | "adyen";
  billing_address?: Address;
}

/**
 * Complete checkout request
 */
export interface CompleteCheckoutRequest {
  buyer?: Buyer;
  payment_data: PaymentData;
  authentication_result?: AuthenticationResult;
  /** Preferred language for post-purchase messages (en, es, fr). Defaults to 'en' */
  preferred_language?: SupportedLanguage;
}

// =============================================================================
// PSP Request/Response Types
// =============================================================================

/**
 * Card number type
 */
export type CardNumberType = "fpan" | "dpan";

/**
 * Payment method input for PSP
 */
export interface PaymentMethodInput {
  type: "card";
  card_number_type: CardNumberType;
  virtual: boolean;
  number: string;
  exp_month: string;
  exp_year: string;
  display_card_funding_type: "credit" | "debit" | "prepaid";
  display_last4: string;
}

/**
 * Allowance constraints for vault token
 */
export interface Allowance {
  reason: "one_time" | "subscription";
  max_amount: number;
  currency: string;
  checkout_session_id: string;
  merchant_id: string;
  expires_at: string;
}

/**
 * Risk signal for fraud prevention
 */
export interface RiskSignal {
  type: "card_testing" | "fraud" | "velocity";
  action: "authorized" | "blocked" | "review";
}

/**
 * Delegate payment request to PSP
 */
export interface DelegatePaymentRequest {
  payment_method: PaymentMethodInput;
  allowance: Allowance;
  risk_signals: RiskSignal[];
  billing_address?: Address;
}

/**
 * Vault token metadata
 */
export interface VaultTokenMetadata {
  source: string;
  merchant_id: string;
  idempotency_key?: string;
}

/**
 * Delegate payment response from PSP
 */
export interface DelegatePaymentResponse {
  id: string;
  created: string;
  metadata: VaultTokenMetadata;
}

// =============================================================================
// API Error Types
// =============================================================================

/**
 * API error types
 */
export type APIErrorType =
  | "invalid_request"
  | "request_not_idempotent"
  | "processing_error"
  | "service_unavailable"
  | "not_found"
  | "method_not_allowed"
  | "unauthorized"
  | "forbidden"
  | "network_error"
  | "unknown_error";

/**
 * API error response
 */
export interface APIError {
  type: APIErrorType;
  code: string;
  message: string;
  param?: string;
}

// =============================================================================
// Chat & Request Logging
// =============================================================================

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

// =============================================================================
// Agent Activity Types
// =============================================================================

/**
 * Agent types for activity logging
 */
export type AgentType = "promotion" | "recommendation" | "post_purchase" | "search";

/**
 * Agent activity event status
 */
export type AgentActivityStatus = "pending" | "success" | "error" | "skipped";

/**
 * Input signals for promotion agent
 */
export interface PromotionInputSignals {
  productId: string;
  productName: string;
  stockCount: number;
  basePrice: number; // in cents
  competitorPrice: number | null; // in cents, null if not available
  inventoryPressure: "high" | "low";
  competitionPosition: "above_market" | "at_market" | "below_market" | "unknown";
}

/**
 * Promotion decision from agent
 */
export interface PromotionDecision {
  action: string; // e.g., "DISCOUNT_10_PCT"
  discountAmount: number; // in cents
  reasonCodes: string[];
  reasoning: string;
}

/**
 * Input signals for post-purchase agent
 */
export interface PostPurchaseInputSignals {
  orderId: string;
  customerName: string;
  productName: string;
  status: "order_confirmed" | "order_shipped" | "out_for_delivery" | "delivered";
  tone: "friendly" | "professional" | "casual" | "urgent";
  language: "en" | "es" | "fr";
}

/**
 * Post-purchase message decision from agent
 */
export interface PostPurchaseDecision {
  subject: string;
  message: string;
  status: string;
  language: string;
  trackingUrl?: string;
}

/**
 * Input signals for recommendation agent
 */
export interface RecommendationInputSignals {
  productId: string;
  productName: string;
  cartItems: Array<{ productId: string; name: string; price: number }>;
}

/**
 * Single recommendation from the ARAG agent
 */
export interface RecommendationItem {
  productId: string;
  productName: string;
  rank: number;
  reasoning: string;
}

/**
 * Pipeline trace from ARAG agent
 */
export interface RecommendationPipelineTrace {
  candidatesFound: number;
  afterNliFilter: number;
  finalRanked: number;
}

/**
 * Recommendation decision from ARAG agent
 */
export interface RecommendationDecision {
  recommendations: RecommendationItem[];
  userIntent?: string;
  pipelineTrace?: RecommendationPipelineTrace;
}

/**
 * Input signals for search agent
 */
export interface SearchInputSignals {
  query: string;
  limit: number;
}

/**
 * Search result item
 */
export interface SearchResultItem {
  productId: string;
  productName: string;
}

/**
 * Search decision from agent
 */
export interface SearchDecision {
  results: SearchResultItem[];
  totalResults: number;
}

/**
 * Union type for agent input signals
 */
export type AgentInputSignals =
  | PromotionInputSignals
  | PostPurchaseInputSignals
  | RecommendationInputSignals
  | SearchInputSignals;

/**
 * Union type for agent decisions
 */
export type AgentDecision =
  | PromotionDecision
  | PostPurchaseDecision
  | RecommendationDecision
  | SearchDecision;

/**
 * Agent activity event for the activity panel
 */
export interface AgentActivityEvent {
  id: string;
  timestamp: Date;
  status: AgentActivityStatus;
  duration?: number; // in milliseconds
  agentType: AgentType;
  inputSignals: AgentInputSignals;
  decision?: AgentDecision;
  error?: string;
}

// =============================================================================
// Checkout Flow State Machine
// =============================================================================

/**
 * Checkout flow state machine states
 */
export type CheckoutFlowState =
  | "product_selection"
  | "checkout"
  | "processing"
  | "confirmation"
  | "error";

/**
 * Checkout flow context containing all state
 */
export interface CheckoutFlowContext {
  state: CheckoutFlowState;
  selectedProduct: Product | null;
  quantity: number;
  selectedShippingId: string;
  orderId: string | null;
  sessionId: string | null;
  session: CheckoutSessionResponse | null;
  vaultToken: string | null;
  isLoading: boolean;
  error: APIError | null;
  checkoutStep: CheckoutStep;
  paymentInfo: PaymentFormData | null;
  billingAddress: BillingAddressFormData | null;
}

/**
 * Checkout flow actions for the state machine
 */
export type CheckoutFlowAction =
  | { type: "SELECT_PRODUCT"; product: Product }
  | { type: "SESSION_CREATED"; session: CheckoutSessionResponse }
  | { type: "SESSION_UPDATED"; session: CheckoutSessionResponse }
  | { type: "UPDATE_QUANTITY"; quantity: number }
  | { type: "SELECT_SHIPPING"; shippingId: string }
  | { type: "SUBMIT_PAYMENT" }
  | { type: "PAYMENT_DELEGATED"; vaultToken: string }
  | { type: "PAYMENT_COMPLETE"; session: CheckoutSessionResponse }
  | { type: "AUTHENTICATION_REQUIRED"; session: CheckoutSessionResponse }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_ERROR"; error: APIError }
  | { type: "CLEAR_ERROR" }
  | { type: "RESET" }
  | { type: "SET_PAYMENT_INFO"; paymentInfo: PaymentFormData }
  | { type: "SET_BILLING_ADDRESS"; billingAddress: BillingAddressFormData }
  | { type: "PROCEED_TO_PAYMENT" }
  | { type: "BACK_TO_SUMMARY" };

// =============================================================================
// Payment Form Types (Feature 14)
// =============================================================================

/**
 * Checkout step in the modal flow
 * - "summary": Shows order summary with Continue button (first step)
 * - "payment": Shows payment form with Pay Now button (second step)
 */
export type CheckoutStep = "summary" | "payment";

/**
 * Payment form data for card information
 */
export interface PaymentFormData {
  cardNumber: string;
  expirationDate: string;
  securityCode: string;
}

// =============================================================================
// Language Types (Feature 15)
// =============================================================================

/**
 * Supported languages for post-purchase messages
 * - en: English
 * - es: Spanish (Espanol)
 * - fr: French (Francais)
 */
export type SupportedLanguage = "en" | "es" | "fr";

/**
 * Language option for display in the UI
 */
export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
}

/**
 * Available language options for the language selector
 */
export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "es", label: "Spanish", nativeLabel: "Espanol" },
  { code: "fr", label: "French", nativeLabel: "Francais" },
];

/**
 * Default language for post-purchase messages
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

/**
 * Billing address form data
 */
export interface BillingAddressFormData {
  fullName: string;
  address: string;
  preferredLanguage: SupportedLanguage;
}

/**
 * Default payment form values for demo
 */
export const DEFAULT_PAYMENT_FORM: PaymentFormData = {
  cardNumber: "4242424242424242",
  expirationDate: "12/28",
  securityCode: "123",
};

/**
 * Default billing address values for demo
 */
export const DEFAULT_BILLING_ADDRESS: BillingAddressFormData = {
  fullName: "John Doe",
  address: "123 Main St, San Francisco, CA 94102",
  preferredLanguage: "en",
};
