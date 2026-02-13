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

/**
 * Extension declaration in capabilities.extensions
 */
export interface ExtensionDeclaration {
  name: string;
  extends?: string[];
  schema?: string;
}

/**
 * Session capabilities (minimal extension-focused model)
 */
export interface CheckoutCapabilities {
  extensions?: ExtensionDeclaration[];
}

/**
 * Discount allocation target
 */
export interface DiscountAllocation {
  path: string;
  amount: number;
}

/**
 * Coupon details for applied discounts
 */
export interface CouponDetails {
  id: string;
  name: string;
  percent_off?: number;
  amount_off?: number;
  currency?: string;
}

/**
 * Applied discount
 */
export interface AppliedDiscount {
  id: string;
  code?: string;
  coupon: CouponDetails;
  amount: number;
  automatic?: boolean;
  method?: "each" | "across" | string;
  priority?: number;
  allocations?: DiscountAllocation[];
}

/**
 * Rejected discount code
 */
export interface RejectedDiscount {
  code: string;
  reason: string;
  message?: string;
}

/**
 * Discounts extension response
 */
export interface DiscountsResponse {
  codes: string[];
  applied: AppliedDiscount[];
  rejected?: RejectedDiscount[];
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
export type MessageType = "info" | "warning" | "error";

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
 * Warning message
 */
export interface WarningMessage {
  type: "warning";
  code: string;
  param?: string;
  content_type: "plain" | "markdown";
  content: string;
}

/**
 * Union type for messages
 */
export type Message = InfoMessage | WarningMessage | ErrorMessage;

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

/**
 * Active checkout protocol
 */
export type CheckoutProtocol = "acp" | "ucp";

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
  protocol?: CheckoutProtocol;
  ucpContextId?: string;
  ucpPaymentHandlerId?: string;
  continue_url?: string;
  buyer?: Buyer;
  capabilities?: CheckoutCapabilities;
  payment_provider: PaymentProvider;
  seller_capabilities?: SellerCapabilities;
  discounts?: DiscountsResponse;
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
  capabilities?: {
    extensions?: string[];
  };
  discounts?: {
    codes: string[];
  };
  coupons?: string[];
}

/**
 * Update checkout session request
 */
export interface UpdateCheckoutRequest {
  items?: ItemInput[];
  buyer?: Buyer;
  fulfillment_address?: Address;
  fulfillment_option_id?: string;
  discounts?: {
    codes: string[];
  };
  coupons?: string[];
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
  ucpContextId: string | null;
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

// =============================================================================
// Metrics Dashboard Types
// =============================================================================

/**
 * Time range options for the metrics dashboard
 */
export type TimeRange = "1h" | "24h" | "7d" | "30d";

/**
 * KPI metric data structure
 */
export interface KPIData {
  id: string;
  label: string;
  value: number;
  previousValue?: number;
  format: "currency" | "number" | "percent" | "duration";
  trend?: "up" | "down" | "neutral";
  trendValue?: number;
}

/**
 * Chart data point for time series
 */
export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

/**
 * Revenue chart data point with additional fields
 */
export interface RevenueDataPoint {
  timestamp: string;
  revenue: number;
  orders: number;
}

/**
 * Agent performance metrics
 */
export interface AgentPerformanceData {
  agentType: AgentType;
  label: string;
  successRate: number | null;
  avgLatency: number;
  totalCalls: number;
  errors: number;
}

/**
 * Promotion breakdown data for pie chart
 */
export interface PromotionBreakdownData {
  type: string;
  label: string;
  count: number;
  totalSavings: number;
  color: string;
}

/**
 * Product health data for table
 */
export interface ProductHealthData {
  id: string;
  name: string;
  sku: string;
  stockLevel: number;
  stockStatus: "healthy" | "low" | "critical";
  basePrice: number;
  competitorPrice?: number;
  pricePosition: "above" | "at" | "below" | "unknown";
  needsAttention: boolean;
  attentionReason?: string;
}

/**
 * Recommendation attribution top product row.
 */
export interface RecommendationAttributionTopProductData {
  productId: string;
  productName: string;
  clicks: number;
  purchases: number;
  conversionRate: number | null;
  attributedRevenue: number;
}

/**
 * Recommendation attribution funnel metrics.
 */
export interface RecommendationAttributionData {
  impressions: number;
  clicks: number;
  purchases: number;
  clickThroughRate: number | null;
  conversionRate: number | null;
  attributedRevenue: number;
  topProducts: RecommendationAttributionTopProductData[];
}

/**
 * Merchant metrics API KPI payload.
 */
export interface MetricsAPIKPI {
  id: string;
  label: string;
  value: number;
  previous_value: number;
  format: "currency" | "number" | "percent" | "duration";
  trend: "up" | "down" | "neutral";
  trend_value: number;
}

/**
 * Merchant metrics API promotion payload.
 */
export interface MetricsAPIPromotionBreakdown {
  type: string;
  label: string;
  count: number;
  total_savings: number;
}

/**
 * Merchant metrics API product health payload.
 */
export interface MetricsAPIProductHealth {
  id: string;
  name: string;
  sku: string;
  stock_level: number;
  stock_status: "healthy" | "low" | "critical";
  base_price: number;
  competitor_price?: number;
  price_position: "above" | "at" | "below" | "unknown";
  needs_attention: boolean;
  attention_reason?: string;
}

/**
 * Merchant metrics API effective window payload.
 */
export interface MetricsAPIEffectiveWindow {
  requested_time_range: TimeRange;
  start: string;
  end: string;
  fallback_applied: boolean;
}

/**
 * Merchant metrics API application-level agent outcome payload.
 */
export interface MetricsAPIAgentOutcome {
  agent_type: AgentType;
  total_calls: number;
  errors: number;
  success_rate: number | null;
  source: "application" | "unavailable";
}

/**
 * Merchant metrics API recommendation attribution top product payload.
 */
export interface MetricsAPIRecommendationTopProduct {
  product_id: string;
  product_name: string;
  clicks: number;
  purchases: number;
  conversion_rate: number | null;
  attributed_revenue: number;
}

/**
 * Merchant metrics API recommendation attribution payload.
 */
export interface MetricsAPIRecommendationAttribution {
  impressions: number;
  clicks: number;
  purchases: number;
  click_through_rate: number | null;
  conversion_rate: number | null;
  attributed_revenue: number;
  top_products: MetricsAPIRecommendationTopProduct[];
}

/**
 * Merchant metrics API dashboard response payload.
 */
export interface MetricsDashboardAPIResponse {
  effective_window: MetricsAPIEffectiveWindow;
  kpis: MetricsAPIKPI[];
  revenue_data: RevenueDataPoint[];
  agent_outcomes: MetricsAPIAgentOutcome[];
  recommendation_attribution: MetricsAPIRecommendationAttribution;
  promotion_breakdown: MetricsAPIPromotionBreakdown[];
  product_health: MetricsAPIProductHealth[];
}

/**
 * Phoenix trace data from telemetry
 */
export interface PhoenixTraceData {
  traceId: string;
  spanId: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: "ok" | "error";
  attributes?: Record<string, unknown>;
}

/**
 * Overall metrics state
 */
export interface MetricsState {
  timeRange: TimeRange;
  isLoading: boolean;
  lastUpdated: Date | null;
  kpis: KPIData[];
  revenueData: RevenueDataPoint[];
  agentPerformance: AgentPerformanceData[];
  recommendationAttribution: RecommendationAttributionData;
  promotionBreakdown: PromotionBreakdownData[];
  productHealth: ProductHealthData[];
}

/**
 * Metrics context actions
 */
export type MetricsAction =
  | { type: "SET_TIME_RANGE"; timeRange: TimeRange }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "UPDATE_METRICS"; metrics: Partial<MetricsState> }
  | { type: "REFRESH" };
