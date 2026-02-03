/**
 * ACP Webhook Endpoint
 *
 * This endpoint receives webhook events from the merchant for order lifecycle updates.
 * In the ACP protocol, the agent exposes a webhook endpoint that the merchant calls
 * to notify the agent/user about order status changes and post-purchase communications.
 *
 * Webhook Flow (Merchant → Agent):
 * 1. Order status changes (shipped, delivered, etc.)
 * 2. Merchant generates message via Post-Purchase Agent
 * 3. Merchant sends webhook to this endpoint
 * 4. UI displays notification to user
 *
 * Events:
 * - order_created: Order was created from checkout
 * - order_updated: Order status or details changed
 * - shipping_update: Post-purchase shipping notification (custom extension)
 */

/* eslint-disable no-console */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { webhookEmitter } from "@/lib/webhook-emitter";

// In-memory store for webhook events (kept for backward compatibility with GET endpoint)
// Primary delivery is now via SSE push - no polling required
const webhookEvents: WebhookEvent[] = [];

// Types based on ACP spec
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

// Webhook secret for HMAC validation (should come from env in production)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "whsec_demo_secret";

/**
 * Verify webhook signature using HMAC-SHA256
 */
function verifySignature(
  payload: string,
  signature: string | null,
  timestamp: string | null
): boolean {
  // Skip verification in development if no signature provided
  if (!signature && process.env.NODE_ENV === "development") {
    console.warn("[Webhook] Skipping signature verification in development");
    return true;
  }

  if (!signature || !timestamp) {
    return false;
  }

  // Create signed payload: timestamp.payload
  const signedPayload = `${timestamp}.${payload}`;

  // Compute expected signature
  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(signedPayload)
    .digest("hex");

  // Constant-time comparison
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

/**
 * Generate unique event ID
 */
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();

    // Get signature headers
    const signature = request.headers.get("X-Webhook-Signature");
    const timestamp = request.headers.get("X-Webhook-Timestamp");

    // Verify signature (skip in development for easier testing)
    if (process.env.NODE_ENV === "production") {
      if (!verifySignature(rawBody, signature, timestamp)) {
        console.error("[Webhook] Invalid signature");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    }

    // Parse the webhook payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Validate required fields
    if (!payload.type || !payload.data) {
      return NextResponse.json({ error: "Missing required fields: type, data" }, { status: 400 });
    }

    // Validate checkout_session_id is present
    if (!payload.data.checkout_session_id) {
      return NextResponse.json(
        { error: "Missing required field: data.checkout_session_id" },
        { status: 400 }
      );
    }

    // Create webhook event
    const event: WebhookEvent = {
      id: generateEventId(),
      type: payload.type,
      receivedAt: new Date().toISOString(),
      data: payload.data,
    };

    // Store event (kept for backward compatibility with GET endpoint)
    webhookEvents.push(event);

    // Keep only last 100 events in memory
    if (webhookEvents.length > 100) {
      webhookEvents.shift();
    }

    // Emit event to SSE subscribers for real-time push delivery
    // This is the production-like approach: push immediately, no polling
    webhookEmitter.emitWebhook(event);

    console.log(`[Webhook] Received and pushed event: ${event.type}`, {
      id: event.id,
      checkout_session_id: payload.data.checkout_session_id,
    });

    // Return success
    return NextResponse.json(
      {
        received: true,
        event_id: event.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET endpoint to retrieve webhook events for a specific checkout session
 * This is used by the UI to poll for notifications
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const checkoutSessionId = searchParams.get("checkout_session_id");
  const since = searchParams.get("since"); // ISO timestamp to get events after

  let filteredEvents = webhookEvents;

  // Filter by checkout_session_id if provided
  if (checkoutSessionId) {
    filteredEvents = filteredEvents.filter(
      (event) => event.data.checkout_session_id === checkoutSessionId
    );
  }

  // Filter by timestamp if provided
  if (since) {
    const sinceDate = new Date(since);
    filteredEvents = filteredEvents.filter((event) => new Date(event.receivedAt) > sinceDate);
  }

  return NextResponse.json({
    events: filteredEvents,
    count: filteredEvents.length,
  });
}

/**
 * DELETE endpoint to clear all stored webhook events
 * Called on page load/refresh and tab switch to start fresh
 */
export async function DELETE() {
  const count = webhookEvents.length;
  webhookEvents.length = 0; // Clear the array in place
  console.log(`[Webhook] Cleared ${count} stored events`);
  return NextResponse.json({ cleared: count });
}
