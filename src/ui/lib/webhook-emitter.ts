/**
 * Webhook Event Emitter
 *
 * A simple pub/sub mechanism to bridge webhook POST events to SSE subscribers.
 * This enables real-time push notifications when merchants send webhooks.
 *
 * Production-like architecture:
 * 1. Merchant POSTs webhook → API route receives and emits event
 * 2. SSE endpoint pushes event to all connected clients
 * 3. Client receives immediately (no polling)
 */

import { EventEmitter } from "events";

// Webhook event data types (matching the API route types)
export interface WebhookEvent {
  id: string;
  type: "order_created" | "order_updated" | "shipping_update";
  receivedAt: string;
  data: OrderEventData | ShippingUpdateData;
}

export interface OrderEventData {
  type: "order";
  checkout_session_id: string;
  order_id?: string;
  permalink_url: string;
  status: "created" | "manual_review" | "confirmed" | "canceled" | "shipped" | "fulfilled";
  refunds: Array<{
    type: "store_credit" | "original_payment";
    amount: number;
  }>;
}

export interface ShippingUpdateData {
  type: "shipping_update";
  checkout_session_id: string;
  order_id: string;
  status: "order_confirmed" | "order_shipped" | "out_for_delivery" | "delivered";
  language: "en" | "es" | "fr";
  subject: string;
  message: string;
  tracking_url?: string;
}

/**
 * Global webhook event emitter singleton.
 * Uses Node.js EventEmitter for simplicity.
 *
 * IMPORTANT: Uses globalThis to ensure true singleton across Next.js App Router
 * API routes, which can have separate module instances due to code splitting.
 *
 * Note: In a production multi-instance setup, you'd use Redis Pub/Sub
 * or a similar distributed messaging system.
 */
class WebhookEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Increase max listeners to avoid warnings with many SSE connections
    this.setMaxListeners(100);
  }

  /**
   * Emit a webhook event to all subscribers
   */
  emitWebhook(event: WebhookEvent): void {
    this.emit("webhook", event);
  }

  /**
   * Subscribe to webhook events
   * @returns Unsubscribe function
   */
  subscribe(callback: (event: WebhookEvent) => void): () => void {
    this.on("webhook", callback);
    return () => {
      this.off("webhook", callback);
    };
  }
}

// Use Symbol.for to get a global key that persists across module instances
const WEBHOOK_EMITTER_KEY = Symbol.for("acp.webhook-emitter");

// Type augmentation for globalThis
const globalForWebhook = globalThis as typeof globalThis & {
  [WEBHOOK_EMITTER_KEY]?: WebhookEventEmitter;
};

// Export the singleton instance using globalThis for true global singleton
// This ensures the same instance is shared across all Next.js API routes
export const webhookEmitter =
  globalForWebhook[WEBHOOK_EMITTER_KEY] ?? (globalForWebhook[WEBHOOK_EMITTER_KEY] = new WebhookEventEmitter());
