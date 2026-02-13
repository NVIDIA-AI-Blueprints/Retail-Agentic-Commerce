/**
 * API Client for ACP Merchant and PSP endpoints
 *
 * Provides type-safe methods for all checkout session operations
 * and PSP payment delegation.
 */

import type {
  CheckoutProtocol,
  CheckoutSessionResponse,
  CreateCheckoutRequest,
  UpdateCheckoutRequest,
  CompleteCheckoutRequest,
  DelegatePaymentRequest,
  DelegatePaymentResponse,
  APIError,
  TimeRange,
  MetricsDashboardAPIResponse,
  Total,
  Message,
  LineItem,
  PaymentProvider,
  FulfillmentOption,
} from "@/types";

// =============================================================================
// Environment Configuration
// =============================================================================

// Environment detection
const isServer = typeof window === "undefined";

// URL configuration
// - Client-side: always uses /api/proxy/* paths (keys handled server-side)
// - Server-side: uses direct URLs for server components/actions
const API_URL = isServer
  ? process.env.MERCHANT_API_URL || "http://localhost:8000"
  : "/api/proxy/merchant";

const PSP_URL = isServer ? process.env.PSP_API_URL || "http://localhost:8001" : "/api/proxy/psp";

// API keys: only used server-side (proxy routes handle client auth)
const MERCHANT_API_KEY = isServer ? process.env.MERCHANT_API_KEY || "" : "";
const PSP_API_KEY = isServer ? process.env.PSP_API_KEY || "" : "";

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "2026-01-16";
const UCP_A2A_EXTENSION_URL = "https://ucp.dev/2026-01-23/specification/reference/";
const UCP_CHECKOUT_KEY = "a2a.ucp.checkout";
const UCP_PLATFORM_PROFILE_URL =
  process.env.NEXT_PUBLIC_UCP_PLATFORM_PROFILE_URL || "https://platform.example/profile";

export interface ProtocolSessionRef {
  sessionId: string | null;
  contextId?: string | null;
  paymentHandlerId?: string | null;
}

interface UCPA2ATotal {
  type: string;
  label: string;
  amount: number;
}

interface UCPA2ALineItem {
  id: string;
  item: {
    id: string;
    title: string;
    price: number;
  };
  quantity: number;
  totals: UCPA2ATotal[];
}

interface UCPA2AMessage {
  type: "info" | "warning" | "error";
  code?: string;
  path?: string;
  content: string;
}

interface UCPA2AOrder {
  id: string;
  permalink_url?: string;
}

interface UCPA2ACheckout {
  id: string;
  status: string;
  currency: string;
  line_items: UCPA2ALineItem[];
  totals: UCPA2ATotal[];
  messages: UCPA2AMessage[];
  order?: UCPA2AOrder;
  continue_url?: string;
  ucp?: {
    capabilities?: Record<
      string,
      Array<{
        version: string;
        extends?: string | string[] | null;
      }>
    >;
    payment_handlers?: Record<string, Array<{ id: string }>>;
  };
}

interface A2AResultPart {
  data?: Record<string, unknown>;
}

interface A2AResultMessage {
  contextId: string;
  parts: A2AResultPart[];
}

interface A2AJsonRpcError {
  code: number;
  message: string;
  data?: {
    detail?: string;
  };
}

interface A2AJsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: A2AResultMessage;
  error?: A2AJsonRpcError;
}

/**
 * Generate a unique idempotency key for payment requests
 */
export function generateIdempotencyKey(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return `idem_${timestamp}_${random}`;
}

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `req_${timestamp}_${random}`;
}

/**
 * Base headers for all API requests
 */
function getBaseHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "API-Version": API_VERSION,
    "Request-Id": generateRequestId(),
  };
}

/**
 * Headers for merchant API requests
 * Authorization is only included server-side; client requests go through proxy
 */
function getMerchantHeaders(idempotencyKey?: string): HeadersInit {
  const headers: HeadersInit = {
    ...getBaseHeaders(),
    ...(MERCHANT_API_KEY ? { Authorization: `Bearer ${MERCHANT_API_KEY}` } : {}),
  };

  if (idempotencyKey) {
    (headers as Record<string, string>)["Idempotency-Key"] = idempotencyKey;
  }

  return headers;
}

function getUCPHeaders(idempotencyKey: string): HeadersInit {
  const headers = getMerchantHeaders(idempotencyKey) as Record<string, string>;
  headers["UCP-Agent"] = `profile="${UCP_PLATFORM_PROFILE_URL}"`;
  headers["X-A2A-Extensions"] = UCP_A2A_EXTENSION_URL;
  return headers;
}

/**
 * Headers for PSP API requests
 * Authorization is only included server-side; client requests go through proxy
 */
function getPSPHeaders(idempotencyKey: string): HeadersInit {
  return {
    ...getBaseHeaders(),
    ...(PSP_API_KEY ? { Authorization: `Bearer ${PSP_API_KEY}` } : {}),
    "Idempotency-Key": idempotencyKey,
  };
}

/**
 * Parse API error response
 */
async function parseErrorResponse(response: Response): Promise<APIError> {
  try {
    const data = await response.json();
    return {
      type: data.type || "unknown_error",
      code: data.code || "unknown",
      message: data.message || `HTTP ${response.status} error`,
      param: data.param,
    };
  } catch {
    return {
      type: "network_error",
      code: "parse_error",
      message: `HTTP ${response.status}: ${response.statusText}`,
    };
  }
}

/**
 * Handle API response and throw on error
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  return response.json();
}

function mapUCPStatusToACP(status: string): CheckoutSessionResponse["status"] {
  switch (status) {
    case "ready_for_complete":
      return "ready_for_payment";
    case "complete_in_progress":
      return "in_progress";
    case "completed":
      return "completed";
    case "canceled":
      return "canceled";
    case "requires_escalation":
    case "incomplete":
    default:
      return "not_ready_for_payment";
  }
}

function mapUCPTotalType(type: string): Total["type"] {
  switch (type) {
    case "items_discount":
      return "items_discount";
    case "discount":
      return "discount";
    case "tax":
      return "tax";
    case "total":
      return "total";
    case "subtotal":
    default:
      return "subtotal";
  }
}

function mapUCPMessages(messages: UCPA2AMessage[]): Message[] {
  return messages.map((message) => {
    if (message.type === "warning") {
      return {
        type: "warning",
        code: message.code ?? "warning",
        content_type: "plain",
        content: message.content,
        ...(message.path ? { param: message.path } : {}),
      };
    }
    if (message.type === "error") {
      return {
        type: "error",
        code: "invalid",
        content_type: "plain",
        content: message.content,
        ...(message.path ? { param: message.path } : {}),
      };
    }
    return {
      type: "info",
      content_type: "plain",
      content: message.content,
      ...(message.path ? { param: message.path } : {}),
    };
  });
}

function normalizeUCPCheckout(
  checkout: UCPA2ACheckout,
  contextId: string
): CheckoutSessionResponse {
  const handlerNamespaces = Object.keys(checkout.ucp?.payment_handlers ?? {});
  const handlerIds = Object.values(checkout.ucp?.payment_handlers ?? {})
    .flatMap((handlers) => handlers.map((handler) => handler.id))
    .filter((handlerId): handlerId is string => Boolean(handlerId));
  const negotiatedHandlerId = handlerIds[0];

  const lineItems: LineItem[] = checkout.line_items.map((item) => {
    const subtotal = item.totals.find((total) => total.type === "subtotal")?.amount ?? 0;
    const tax = item.totals.find((total) => total.type === "tax")?.amount ?? 0;
    const total = item.totals.find((total) => total.type === "total")?.amount ?? subtotal + tax;
    const baseAmount = item.item.price * item.quantity;
    const inferredDiscount = Math.max(0, baseAmount - subtotal);
    return {
      id: item.id,
      item: {
        id: item.item.id,
        quantity: item.quantity,
      },
      name: item.item.title,
      base_amount: baseAmount,
      // UCP line items do not currently include promotion metadata in this phase.
      // Infer effective discount from base price vs subtotal so UI activity remains accurate.
      discount: inferredDiscount,
      subtotal,
      tax,
      total,
    };
  });

  const totals: Total[] = checkout.totals.map((total) => ({
    type: mapUCPTotalType(total.type),
    display_text: total.label,
    amount: total.amount,
  }));

  const paymentProvider: PaymentProvider = {
    provider: "stripe",
    supported_payment_methods: [
      {
        type: "card",
        supported_card_networks: ["visa", "mastercard", "amex", "discover"],
      },
    ],
  };

  // Fulfillment extension is deferred in UCP responses for this phase.
  // Keep the native checkout UI stable with synthetic options aligned to backend defaults.
  const fulfillmentOptions: FulfillmentOption[] = [
    {
      type: "shipping",
      id: "shipping_standard",
      title: "Standard Shipping",
      subtitle: "5-7 business days",
      subtotal: 599,
      tax: 0,
      total: 599,
    },
    {
      type: "shipping",
      id: "shipping_express",
      title: "Express Shipping",
      subtitle: "2-3 business days",
      subtotal: 1299,
      tax: 0,
      total: 1299,
    },
  ];

  const response: CheckoutSessionResponse = {
    id: checkout.id,
    status: mapUCPStatusToACP(checkout.status),
    currency: checkout.currency.toLowerCase(),
    protocol: "ucp",
    ucpContextId: contextId,
    ucpRawStatus: checkout.status,
    ucpPlatformProfileUrl: UCP_PLATFORM_PROFILE_URL,
    ...(handlerIds.length > 0 ? { ucpPaymentHandlerIds: handlerIds } : {}),
    ...(handlerNamespaces.length > 0 ? { ucpPaymentHandlerNamespaces: handlerNamespaces } : {}),
    ...(negotiatedHandlerId ? { ucpPaymentHandlerId: negotiatedHandlerId } : {}),
    payment_provider: paymentProvider,
    ...(checkout.ucp?.capabilities
      ? {
          capabilities: {
            extensions: Object.keys(checkout.ucp.capabilities).map((name) => ({ name })),
          },
        }
      : {}),
    line_items: lineItems,
    fulfillment_options: fulfillmentOptions,
    totals,
    messages: mapUCPMessages(checkout.messages),
    links: [],
    ...(checkout.order
      ? {
          order: {
            id: checkout.order.id,
            checkout_session_id: checkout.id,
            permalink_url: checkout.order.permalink_url ?? "#",
          },
        }
      : {}),
    ...(checkout.continue_url ? { continue_url: checkout.continue_url } : {}),
  };

  return response;
}

function buildA2AMessage(
  action: string,
  data: Record<string, unknown>,
  contextId?: string | null,
  extraParts?: Array<Record<string, unknown>>
): Record<string, unknown> {
  const parts: Array<Record<string, unknown>> = [{ kind: "data", data: { action, ...data } }];
  if (extraParts) {
    parts.push(...extraParts);
  }

  const message: Record<string, unknown> = {
    role: "user",
    messageId: generateIdempotencyKey(),
    kind: "message",
    parts,
  };
  if (contextId) {
    message.contextId = contextId;
  }
  return {
    jsonrpc: "2.0",
    id: generateRequestId(),
    method: "message/send",
    params: { message },
  };
}

async function postA2AAction(
  action: string,
  data: Record<string, unknown>,
  contextId?: string | null,
  extraParts?: Array<Record<string, unknown>>
): Promise<CheckoutSessionResponse> {
  const response = await fetch(`${API_URL}/a2a`, {
    method: "POST",
    headers: getUCPHeaders(generateIdempotencyKey()),
    body: JSON.stringify(buildA2AMessage(action, data, contextId, extraParts)),
  });

  const json = (await handleResponse<A2AJsonRpcResponse>(response)) as A2AJsonRpcResponse;

  if (json.error) {
    throw {
      type: "invalid_request",
      code: "jsonrpc_error",
      message: json.error.data?.detail ?? json.error.message,
    } satisfies APIError;
  }

  const result = json.result;
  const checkoutData = result?.parts?.[0]?.data?.[UCP_CHECKOUT_KEY];
  if (!result || !checkoutData || typeof checkoutData !== "object") {
    throw {
      type: "unknown_error",
      code: "parse_error",
      message: "Invalid A2A response: missing checkout payload",
    } satisfies APIError;
  }

  return normalizeUCPCheckout(checkoutData as UCPA2ACheckout, result.contextId);
}

// =============================================================================
// Merchant API Methods
// =============================================================================

/**
 * Create a new checkout session
 */
export async function createCheckoutSession(
  request: CreateCheckoutRequest
): Promise<CheckoutSessionResponse> {
  const response = await fetch(`${API_URL}/checkout_sessions`, {
    method: "POST",
    headers: getMerchantHeaders(generateIdempotencyKey()),
    body: JSON.stringify(request),
  });

  return handleResponse<CheckoutSessionResponse>(response);
}

/**
 * Get an existing checkout session
 */
export async function getCheckoutSession(sessionId: string): Promise<CheckoutSessionResponse> {
  const response = await fetch(`${API_URL}/checkout_sessions/${sessionId}`, {
    method: "GET",
    headers: getMerchantHeaders(),
  });

  return handleResponse<CheckoutSessionResponse>(response);
}

/**
 * Update a checkout session
 */
export async function updateCheckoutSession(
  sessionId: string,
  request: UpdateCheckoutRequest
): Promise<CheckoutSessionResponse> {
  const response = await fetch(`${API_URL}/checkout_sessions/${sessionId}`, {
    method: "POST",
    headers: getMerchantHeaders(generateIdempotencyKey()),
    body: JSON.stringify(request),
  });

  return handleResponse<CheckoutSessionResponse>(response);
}

/**
 * Complete a checkout session with payment
 */
export async function completeCheckout(
  sessionId: string,
  request: CompleteCheckoutRequest
): Promise<CheckoutSessionResponse> {
  const response = await fetch(`${API_URL}/checkout_sessions/${sessionId}/complete`, {
    method: "POST",
    headers: getMerchantHeaders(generateIdempotencyKey()),
    body: JSON.stringify(request),
  });

  return handleResponse<CheckoutSessionResponse>(response);
}

/**
 * Cancel a checkout session
 */
export async function cancelCheckout(sessionId: string): Promise<CheckoutSessionResponse> {
  const response = await fetch(`${API_URL}/checkout_sessions/${sessionId}/cancel`, {
    method: "POST",
    headers: getMerchantHeaders(generateIdempotencyKey()),
    body: JSON.stringify({}),
  });

  return handleResponse<CheckoutSessionResponse>(response);
}

/**
 * Create checkout session using protocol-specific transport.
 */
export async function createCheckoutSessionByProtocol(
  protocol: CheckoutProtocol,
  request: CreateCheckoutRequest
): Promise<CheckoutSessionResponse> {
  if (protocol === "acp") {
    return createCheckoutSession(request);
  }

  const firstItem = request.items[0];
  if (!firstItem) {
    throw {
      type: "invalid_request",
      code: "missing",
      message: "At least one item is required to create a checkout session",
    } satisfies APIError;
  }

  return postA2AAction("create_checkout", {
    product_id: firstItem.id,
    quantity: firstItem.quantity,
    line_items: request.items.map((item) => ({ id: item.id, quantity: item.quantity })),
    buyer: request.buyer,
    fulfillment_address: request.fulfillment_address,
    discounts: request.discounts,
    coupons: request.coupons,
  });
}

/**
 * Update checkout session using protocol-specific transport.
 */
export async function updateCheckoutSessionByProtocol(
  protocol: CheckoutProtocol,
  sessionRef: ProtocolSessionRef,
  request: UpdateCheckoutRequest
): Promise<CheckoutSessionResponse> {
  if (!sessionRef.sessionId) {
    throw {
      type: "invalid_request",
      code: "session_not_found",
      message: "Missing checkout session ID",
    } satisfies APIError;
  }

  if (protocol === "acp") {
    return updateCheckoutSession(sessionRef.sessionId, request);
  }

  if (!sessionRef.contextId) {
    throw {
      type: "invalid_request",
      code: "session_not_found",
      message: "Missing UCP context ID for checkout update",
    } satisfies APIError;
  }

  const payload: Record<string, unknown> = {};
  if (request.items !== undefined) {
    payload.items = request.items;
    payload.line_items = request.items.map((item) => ({ id: item.id, quantity: item.quantity }));
  }
  if (request.buyer !== undefined) {
    payload.buyer = request.buyer;
  }
  if (request.fulfillment_address !== undefined) {
    payload.fulfillment_address = request.fulfillment_address;
  }
  if (request.fulfillment_option_id !== undefined) {
    payload.fulfillment_option_id = request.fulfillment_option_id;
  }
  if (request.discounts !== undefined) {
    payload.discounts = request.discounts;
  }
  if (request.coupons !== undefined) {
    payload.coupons = request.coupons;
  }

  return postA2AAction("update_checkout", payload, sessionRef.contextId);
}

/**
 * Complete checkout session using protocol-specific transport.
 */
export async function completeCheckoutByProtocol(
  protocol: CheckoutProtocol,
  sessionRef: ProtocolSessionRef,
  request: CompleteCheckoutRequest
): Promise<CheckoutSessionResponse> {
  if (!sessionRef.sessionId) {
    throw {
      type: "invalid_request",
      code: "session_not_found",
      message: "Missing checkout session ID",
    } satisfies APIError;
  }

  if (protocol === "acp") {
    return completeCheckout(sessionRef.sessionId, request);
  }

  if (!sessionRef.contextId) {
    throw {
      type: "invalid_request",
      code: "session_not_found",
      message: "Missing UCP context ID for checkout completion",
    } satisfies APIError;
  }

  const handlerId = sessionRef.paymentHandlerId?.trim();
  if (!handlerId) {
    throw {
      type: "invalid_request",
      code: "missing",
      message: "Missing negotiated UCP payment handler ID for checkout completion",
    } satisfies APIError;
  }

  return postA2AAction("complete_checkout", {}, sessionRef.contextId, [
    {
      kind: "data",
      data: {
        "a2a.ucp.checkout.payment": {
          instruments: [
            {
              id: request.payment_data.token,
              type: "tokenized_card",
              handler_id: handlerId,
              credential: {
                token: request.payment_data.token,
              },
            },
          ],
        },
      },
    },
  ]);
}

/**
 * Get aggregated metrics dashboard data.
 */
export async function getMetricsDashboard(
  timeRange: TimeRange
): Promise<MetricsDashboardAPIResponse> {
  const response = await fetch(`${API_URL}/metrics/dashboard?time_range=${timeRange}`, {
    method: "GET",
    headers: getMerchantHeaders(),
  });

  return handleResponse<MetricsDashboardAPIResponse>(response);
}

// =============================================================================
// PSP API Methods
// =============================================================================

/**
 * Delegate payment to PSP and get vault token
 */
export async function delegatePayment(
  request: DelegatePaymentRequest
): Promise<DelegatePaymentResponse> {
  const idempotencyKey = generateIdempotencyKey();

  const response = await fetch(`${PSP_URL}/agentic_commerce/delegate_payment`, {
    method: "POST",
    headers: getPSPHeaders(idempotencyKey),
    body: JSON.stringify(request),
  });

  return handleResponse<DelegatePaymentResponse>(response);
}

// =============================================================================
// Post-Purchase Agent API Methods
// =============================================================================

/**
 * Brand persona for post-purchase messages
 */
export interface BrandPersona {
  company_name: string;
  tone: "friendly" | "professional" | "casual" | "urgent";
  preferred_language: "en" | "es" | "fr";
}

/**
 * Order context for post-purchase messages
 */
export interface OrderContext {
  order_id: string;
  customer_name: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  tracking_url: string | null;
  estimated_delivery: string;
}

/**
 * Post-purchase message request
 */
export interface PostPurchaseMessageRequest {
  brand_persona: BrandPersona;
  order: OrderContext;
  status: "order_confirmed" | "order_shipped" | "out_for_delivery" | "delivered";
}

/**
 * Post-purchase message response from agent
 */
export interface PostPurchaseMessageResponse {
  order_id: string;
  status: string;
  language: string;
  subject: string;
  message: string;
}

/**
 * Generate a post-purchase shipping message using the NAT agent
 * Uses the Next.js proxy route to avoid CORS issues
 */
export async function generatePostPurchaseMessage(
  request: PostPurchaseMessageRequest
): Promise<PostPurchaseMessageResponse> {
  const response = await fetch("/api/agents/post-purchase", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      type: "processing_error",
      code: "agent_error",
      message: errorData.error || `Post-Purchase Agent error: ${response.status}`,
    };
  }

  return response.json();
}

/**
 * Webhook payload for shipping updates (shared ACP/UCP UI shape)
 */
export interface WebhookShippingPayload {
  type: "shipping_update";
  data: {
    type: "shipping_update";
    checkout_session_id: string;
    order_id: string;
    status: "order_confirmed" | "order_shipped" | "out_for_delivery" | "delivered";
    language: string;
    subject: string;
    message: string;
    tracking_url?: string;
  };
}

/**
 * Response from webhook endpoint
 */
export interface WebhookResponse {
  received: boolean;
  event_id: string;
}

/**
 * Post shipping update to the client agent's webhook endpoint
 * This simulates the merchant sending a notification to the client agent
 */
export async function postWebhookShippingUpdate(
  payload: WebhookShippingPayload,
  protocol: CheckoutProtocol = "acp"
): Promise<WebhookResponse> {
  const webhookEndpoint = protocol === "ucp" ? "/api/webhooks/ucp" : "/api/webhooks/acp";
  const response = await fetch(webhookEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Webhook-Timestamp": new Date().toISOString(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      type: "processing_error",
      code: "webhook_error",
      message: errorData.error || `Webhook error: ${response.status}`,
    };
  }

  return response.json();
}

// =============================================================================
// API Client Object (for convenience)
// =============================================================================

export const apiClient = {
  // Merchant endpoints
  createCheckoutSession,
  createCheckoutSessionByProtocol,
  getCheckoutSession,
  updateCheckoutSession,
  updateCheckoutSessionByProtocol,
  completeCheckout,
  completeCheckoutByProtocol,
  cancelCheckout,

  // PSP endpoints
  delegatePayment,

  // Post-Purchase Agent
  generatePostPurchaseMessage,

  // Webhook
  postWebhookShippingUpdate,

  // Utilities
  generateIdempotencyKey,
  generateRequestId,
};

export default apiClient;
