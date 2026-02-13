/* eslint-disable no-console */

import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { webhookEmitter } from "@/lib/webhook-emitter";

type ShippingStatus = "order_confirmed" | "order_shipped" | "out_for_delivery" | "delivered";

interface ShippingUpdateData {
  type: "shipping_update";
  checkout_session_id: string;
  order_id: string;
  status: ShippingStatus;
  language: "en" | "es" | "fr";
  subject: string;
  message: string;
  tracking_url?: string;
}

interface WebhookEvent {
  id: string;
  type: "shipping_update";
  receivedAt: string;
  protocol?: "acp" | "ucp";
  data: ShippingUpdateData;
}

interface UCPFulfillmentEvent {
  type?: string;
  description?: string;
  tracking_url?: string;
  occurred_at?: string;
}

interface UCPOrderWebhookPayload {
  event_id: string;
  created_time: string;
  order: {
    id: string;
    checkout_id: string;
    fulfillment?: {
      events?: UCPFulfillmentEvent[];
    };
  };
}

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "whsec_demo_secret";
const webhookEvents: WebhookEvent[] = [];

function decodeBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64");
}

function verifyRequestSignature(
  payload: string,
  requestSignature: string | null,
  requestUrl: string
): boolean {
  if (!requestSignature && process.env.NODE_ENV === "development") {
    console.warn("[UCP Webhook] Skipping Request-Signature verification in development");
    return true;
  }

  if (!requestSignature) {
    return false;
  }

  const parts = requestSignature.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [encodedHeader, encodedClaims, encodedSignature] = parts;
  if (!encodedHeader || !encodedClaims || !encodedSignature) {
    return false;
  }

  const signingInput = `${encodedHeader}.${encodedClaims}`;
  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(signingInput)
    .digest();

  let providedSignature: Buffer;
  try {
    providedSignature = decodeBase64Url(encodedSignature);
  } catch {
    return false;
  }

  if (providedSignature.length !== expectedSignature.length) {
    return false;
  }
  if (!crypto.timingSafeEqual(providedSignature, expectedSignature)) {
    return false;
  }

  let claims: Record<string, unknown>;
  try {
    claims = JSON.parse(decodeBase64Url(encodedClaims).toString("utf-8")) as Record<
      string,
      unknown
    >;
  } catch {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = typeof claims.exp === "number" ? claims.exp : -1;
  const iat = typeof claims.iat === "number" ? claims.iat : -1;
  const aud = typeof claims.aud === "string" ? claims.aud : "";
  const htu = typeof claims.htu === "string" ? claims.htu : "";
  const htm = typeof claims.htm === "string" ? claims.htm : "";
  const bodySha = typeof claims.body_sha256 === "string" ? claims.body_sha256 : "";

  if (exp < now || iat > now + 60) {
    return false;
  }
  if (aud !== new URL(requestUrl).host) {
    return false;
  }
  if (htu !== requestUrl || htm.toUpperCase() !== "POST") {
    return false;
  }

  const computedBodySha = crypto.createHash("sha256").update(payload).digest("hex");
  return bodySha === computedBodySha;
}

function mapFulfillmentTypeToShippingStatus(type: string | undefined): ShippingStatus {
  switch (type) {
    case "delivered":
      return "delivered";
    case "out_for_delivery":
      return "out_for_delivery";
    case "order_shipped":
    case "shipped":
      return "order_shipped";
    default:
      return "order_confirmed";
  }
}

function getLatestFulfillmentEvent(payload: UCPOrderWebhookPayload): UCPFulfillmentEvent | null {
  const events = payload.order.fulfillment?.events;
  if (!events || events.length === 0) {
    return null;
  }
  const sorted = [...events].sort((a, b) => {
    const aTime = a.occurred_at ? Date.parse(a.occurred_at) : 0;
    const bTime = b.occurred_at ? Date.parse(b.occurred_at) : 0;
    return aTime - bTime;
  });
  return sorted[sorted.length - 1] ?? null;
}

function splitSubjectAndMessage(description: string): { subject: string; message: string } {
  const trimmed = description.trim();
  if (!trimmed) {
    return {
      subject: "Order Update",
      message: "Your order has been updated.",
    };
  }

  const lines = trimmed
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return {
      subject: "Order Update",
      message: trimmed,
    };
  }
  return {
    subject: lines[0] ?? "Order Update",
    message: trimmed,
  };
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const requestSignature = request.headers.get("Request-Signature");

    if (process.env.NODE_ENV === "production") {
      if (!verifyRequestSignature(rawBody, requestSignature, request.url)) {
        console.error("[UCP Webhook] Invalid Request-Signature");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    }

    let payload: UCPOrderWebhookPayload;
    try {
      payload = JSON.parse(rawBody) as UCPOrderWebhookPayload;
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    if (!payload.event_id || !payload.order?.id || !payload.order?.checkout_id) {
      return NextResponse.json(
        { error: "Missing required fields: event_id, order.id, order.checkout_id" },
        { status: 400 }
      );
    }

    const latestEvent = getLatestFulfillmentEvent(payload);
    const status = mapFulfillmentTypeToShippingStatus(latestEvent?.type);
    const { subject, message } = splitSubjectAndMessage(
      latestEvent?.description ?? "Your order has been confirmed."
    );

    const event: WebhookEvent = {
      id: payload.event_id,
      type: "shipping_update",
      receivedAt: new Date().toISOString(),
      protocol: "ucp",
      data: {
        type: "shipping_update",
        checkout_session_id: payload.order.checkout_id,
        order_id: payload.order.id,
        status,
        language: "en",
        subject,
        message,
        ...(latestEvent?.tracking_url ? { tracking_url: latestEvent.tracking_url } : {}),
      },
    };

    webhookEvents.push(event);
    if (webhookEvents.length > 100) {
      webhookEvents.shift();
    }

    webhookEmitter.emitWebhook(event);
    return NextResponse.json({ received: true, event_id: event.id }, { status: 200 });
  } catch (error) {
    console.error("[UCP Webhook] Error processing webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const checkoutSessionId = searchParams.get("checkout_session_id");
  const since = searchParams.get("since");

  let filteredEvents = webhookEvents;
  if (checkoutSessionId) {
    filteredEvents = filteredEvents.filter(
      (event) => event.data.checkout_session_id === checkoutSessionId
    );
  }
  if (since) {
    const sinceDate = new Date(since);
    filteredEvents = filteredEvents.filter((event) => new Date(event.receivedAt) > sinceDate);
  }

  return NextResponse.json({ events: filteredEvents, count: filteredEvents.length });
}

export async function DELETE() {
  const count = webhookEvents.length;
  webhookEvents.length = 0;
  return NextResponse.json({ cleared: count });
}
