"use client";

/**
 * WebhookToAgentActivityBridge
 *
 * Receives webhooks via SSE and dispatches custom events for the AgentPanel to display.
 * Also updates Agent Activity and Merchant Server panels.
 */

import { useEffect, useRef, useCallback } from "react";
import { useAgentActivityLog } from "@/hooks/useAgentActivityLog";
import { useACPLog } from "@/hooks/useACPLog";
import type { PostPurchaseInputSignals, PostPurchaseDecision } from "@/types";

// Webhook event types
interface ShippingUpdateData {
  type: "shipping_update";
  checkout_session_id: string;
  order_id: string;
  status: "order_confirmed" | "order_shipped" | "out_for_delivery" | "delivered";
  language: "en" | "es" | "fr";
  subject: string;
  message: string;
  tracking_url?: string;
}

interface WebhookEvent {
  id: string;
  type: "order_created" | "order_updated" | "shipping_update";
  receivedAt: string;
  data: ShippingUpdateData | Record<string, unknown>;
}

// Custom event name for AgentPanel to listen to
export const WEBHOOK_NOTIFICATION_EVENT = "webhook-notification";

export function WebhookToAgentActivityBridge() {
  const { addPostPurchaseEvent } = useAgentActivityLog();
  const { logEvent, completeEvent } = useACPLog();
  const seenEventIdsRef = useRef<Set<string>>(new Set());
  const lastReceivedAtRef = useRef<string | null>(null);

  const addPostPurchaseEventRef = useRef(addPostPurchaseEvent);
  const logEventRef = useRef(logEvent);
  const completeEventRef = useRef(completeEvent);

  useEffect(() => {
    addPostPurchaseEventRef.current = addPostPurchaseEvent;
    logEventRef.current = logEvent;
    completeEventRef.current = completeEvent;
  }, [addPostPurchaseEvent, logEvent, completeEvent]);

  const processWebhookEvent = useCallback((event: WebhookEvent) => {
    if (seenEventIdsRef.current.has(event.id)) return;
    seenEventIdsRef.current.add(event.id);

    if (event.receivedAt) {
      if (
        !lastReceivedAtRef.current ||
        new Date(event.receivedAt) > new Date(lastReceivedAtRef.current)
      ) {
        lastReceivedAtRef.current = event.receivedAt;
      }
    }

    if (event.type !== "shipping_update") return;

    const shippingData = event.data as ShippingUpdateData;

    // Update Agent Activity panel
    const inputSignals: PostPurchaseInputSignals = {
      orderId: shippingData.order_id,
      customerName: "Customer",
      productName: "Your Order",
      status: shippingData.status,
      tone: "friendly",
      language: shippingData.language,
    };
    const decision: PostPurchaseDecision = {
      subject: shippingData.subject,
      message: shippingData.message,
      status: shippingData.status,
      language: shippingData.language,
      ...(shippingData.tracking_url ? { trackingUrl: shippingData.tracking_url } : {}),
    };
    addPostPurchaseEventRef.current(inputSignals, decision, "success");

    // Update ACP panel
    const acpEventId = logEventRef.current(
      "webhook_post",
      "POST",
      "/api/webhooks/acp",
      `Shipping update: ${shippingData.status}`
    );
    completeEventRef.current(
      acpEventId,
      "success",
      `Order ${shippingData.order_id.slice(0, 12)}...`,
      200
    );

    // Dispatch custom event for AgentPanel to show notification
    window.dispatchEvent(
      new CustomEvent(WEBHOOK_NOTIFICATION_EVENT, {
        detail: {
          id: event.id,
          subject: shippingData.subject,
          message: shippingData.message,
          status: shippingData.status,
          orderId: shippingData.order_id,
        },
      })
    );

    // Bridge to Apps SDK iframe
    document.querySelectorAll("iframe").forEach((iframe) => {
      try {
        iframe.contentWindow?.postMessage(
          {
            type: "WEBHOOK_NOTIFICATION",
            event: {
              type: "shipping_update",
              orderId: shippingData.order_id,
              status: shippingData.status,
              subject: shippingData.subject,
              message: shippingData.message,
              language: shippingData.language,
              trackingUrl: shippingData.tracking_url,
            },
          },
          "*"
        );
      } catch {
        // Iframe may not be accessible
      }
    });
  }, []);

  const fetchMissedEvents = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (lastReceivedAtRef.current) {
        params.set("since", lastReceivedAtRef.current);
      }
      const response = await fetch(
        `/api/webhooks/acp${params.toString() ? `?${params.toString()}` : ""}`
      );
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      const events = Array.isArray(data.events) ? data.events : [];
      events.forEach((event: WebhookEvent) => {
        processWebhookEvent(event);
      });
    } catch {
      // Ignore fetch errors - SSE will keep trying
    }
  }, [processWebhookEvent]);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      fetchMissedEvents();
      eventSource = new EventSource("/api/webhooks/sse");
      eventSource.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "heartbeat" || data.type === "connected") return;
          processWebhookEvent(data as WebhookEvent);
        } catch {
          // Invalid JSON
        }
      };
      eventSource.onerror = () => {
        eventSource?.close();
        fetchMissedEvents();
        reconnectTimeout = setTimeout(connect, 5000);
      };
    };

    connect();
    return () => {
      eventSource?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [processWebhookEvent, fetchMissedEvents]);

  return null; // No UI - just event dispatching
}
