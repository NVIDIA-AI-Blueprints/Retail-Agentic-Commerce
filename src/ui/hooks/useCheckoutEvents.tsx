"use client";

import { useEffect, useCallback, useRef } from "react";
import { useACPLog, type ACPEventType } from "./useACPLog";

/**
 * SSE event from the MCP server
 */
interface CheckoutSSEEvent {
  id: string;
  type: string;
  endpoint: string;
  method: string;
  status: string;
  summary?: string;
  statusCode?: number;
  sessionId?: string;
  orderId?: string;
  timestamp: string;
}

/**
 * Map SSE event type to ACP log event type
 */
function mapEventType(type: string): ACPEventType {
  switch (type) {
    case "session_create":
      return "session_create";
    case "session_update":
      return "session_update";
    case "delegate_payment":
      return "delegate_payment";
    case "session_complete":
      return "session_complete";
    default:
      return "session_update";
  }
}

/**
 * Hook to subscribe to checkout events from the MCP server via SSE.
 *
 * This allows the Protocol Inspector to display real-time checkout events
 * without requiring the widget to send postMessage. The widget remains
 * fully isolated.
 *
 * @param mcpServerUrl - Base URL of the MCP server (default: http://localhost:2091)
 */
export function useCheckoutEvents(mcpServerUrl = "http://localhost:2091") {
  const { logEvent, completeEvent } = useACPLog();
  const eventSourceRef = useRef<EventSource | null>(null);
  const pendingEventsRef = useRef<Map<string, string>>(new Map());

  const handleEvent = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as CheckoutSSEEvent;
        const acpType = mapEventType(data.type);

        if (data.status === "pending") {
          // Create a new pending event
          const eventId = logEvent(
            acpType,
            (data.method as "POST" | "GET" | "PUT") || "POST",
            data.endpoint,
            data.summary
          );
          // Track pending event by SSE event ID
          pendingEventsRef.current.set(data.id, eventId);
        } else {
          // Find the pending event and complete it
          const pendingEventId = pendingEventsRef.current.get(data.id);
          if (pendingEventId) {
            completeEvent(
              pendingEventId,
              data.status === "success" ? "success" : "error",
              data.summary,
              data.statusCode
            );
            pendingEventsRef.current.delete(data.id);
          } else {
            // No pending event found, create a completed event directly
            const eventId = logEvent(
              acpType,
              (data.method as "POST" | "GET" | "PUT") || "POST",
              data.endpoint,
              data.summary
            );
            completeEvent(
              eventId,
              data.status === "success" ? "success" : "error",
              data.summary,
              data.statusCode
            );
          }
        }
      } catch (error) {
        console.error("[useCheckoutEvents] Failed to parse event:", error);
      }
    },
    [logEvent, completeEvent]
  );

  useEffect(() => {
    // EventSource is only available in browser environment
    if (typeof EventSource === "undefined") {
      return;
    }

    // Connect to SSE endpoint
    const eventSource = new EventSource(`${mcpServerUrl}/events`);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("checkout", handleEvent);

    eventSource.onerror = () => {
      // EventSource will automatically reconnect
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [mcpServerUrl, handleEvent]);
}
