/**
 * API Client for ACP Merchant and PSP endpoints
 *
 * Provides type-safe methods for all checkout session operations
 * and PSP payment delegation.
 */

import type {
  CheckoutSessionResponse,
  CreateCheckoutRequest,
  UpdateCheckoutRequest,
  CompleteCheckoutRequest,
  DelegatePaymentRequest,
  DelegatePaymentResponse,
  APIError,
} from "@/types";

// Environment configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PSP_URL = process.env.NEXT_PUBLIC_PSP_URL || "http://localhost:8001";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";
const PSP_API_KEY = process.env.NEXT_PUBLIC_PSP_API_KEY || "";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "2026-01-16";

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
 */
function getMerchantHeaders(idempotencyKey?: string): HeadersInit {
  const headers: HeadersInit = {
    ...getBaseHeaders(),
    Authorization: `Bearer ${API_KEY}`,
  };

  if (idempotencyKey) {
    (headers as Record<string, string>)["Idempotency-Key"] = idempotencyKey;
  }

  return headers;
}

/**
 * Headers for PSP API requests
 */
function getPSPHeaders(idempotencyKey: string): HeadersInit {
  return {
    ...getBaseHeaders(),
    Authorization: `Bearer ${PSP_API_KEY}`,
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
// API Client Object (for convenience)
// =============================================================================

export const apiClient = {
  // Merchant endpoints
  createCheckoutSession,
  getCheckoutSession,
  updateCheckoutSession,
  completeCheckout,
  cancelCheckout,

  // PSP endpoints
  delegatePayment,

  // Utilities
  generateIdempotencyKey,
  generateRequestId,
};

export default apiClient;
