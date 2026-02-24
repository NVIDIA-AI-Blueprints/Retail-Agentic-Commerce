"use client";

import { useEffect, useCallback, useRef } from "react";
import { useACPLog, type ACPEventType } from "./useACPLog";
import { useAgentActivityLog } from "./useAgentActivityLog";
import type {
  PromotionInputSignals,
  PromotionDecision,
  RecommendationInputSignals,
  RecommendationDecision,
  RecommendationItem,
  RecommendationPipelineTrace,
} from "@/types";

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
 * Agent activity SSE event from the MCP server (promotion)
 */
interface PromotionActivitySSEEvent {
  id: string;
  agentType: "promotion";
  productId: string;
  productName: string;
  action: string;
  discountAmount: number;
  reasonCodes: string[];
  reasoning: string;
  stockCount: number;
  basePrice: number;
  timestamp: string;
}

/**
 * Agent activity SSE event from the MCP server (recommendation)
 */
interface RecommendationActivitySSEEvent {
  id: string;
  agentType: "recommendation";
  status: "pending" | "success" | "error";
  productId: string;
  productName: string;
  cartItems: Array<{ productId: string; name: string; price: number }>;
  // Fields below are only present on complete (success/error) events
  recommendations?: Array<{
    productId: string;
    productName: string;
    rank: number;
    reasoning: string;
  }>;
  userIntent?: string;
  pipelineTrace?: {
    candidatesFound?: number;
    afterNliFilter?: number;
    finalRanked?: number;
  };
  recommendationRequestId?: string;
  latencyMs?: number;
  error?: string;
  timestamp: string;
}

type AgentActivitySSEEvent = PromotionActivitySSEEvent | RecommendationActivitySSEEvent;

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
 * MCP Server base URL - uses nginx proxy in Docker, direct in development
 */
const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || "http://localhost:2091";

/**
 * Hook to subscribe to checkout events from the MCP server via SSE.
 *
 * This allows the Protocol Inspector to display real-time checkout events
 * without requiring the widget to send postMessage. The widget remains
 * fully isolated.
 *
 * @param mcpServerUrl - Base URL of the MCP server
 */
export function useCheckoutEvents(mcpServerUrl = MCP_SERVER_URL) {
  const { logEvent, completeEvent } = useACPLog();
  const { addAgentEvent, logAgentCall, completeAgentCall } = useAgentActivityLog();
  const eventSourceRef = useRef<EventSource | null>(null);
  const pendingEventsRef = useRef<Map<string, string>>(new Map());

  const handleCheckoutEvent = useCallback(
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
        console.error("[useCheckoutEvents] Failed to parse checkout event:", error);
      }
    },
    [logEvent, completeEvent]
  );

  const handleAgentActivityEvent = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as AgentActivitySSEEvent;

        if (data.agentType === "promotion") {
          const promoData = data as PromotionActivitySSEEvent;
          const inputSignals: PromotionInputSignals = {
            productId: promoData.productId,
            productName: promoData.productName,
            stockCount: promoData.stockCount,
            basePrice: promoData.basePrice,
            competitorPrice: null,
            inventoryPressure: promoData.stockCount > 50 ? "high" : "low",
            competitionPosition: inferCompetitionPosition(promoData.reasonCodes),
          };

          const decision: PromotionDecision = {
            action: promoData.action,
            discountAmount: promoData.discountAmount,
            reasonCodes: promoData.reasonCodes,
            reasoning: promoData.reasoning,
          };

          addAgentEvent("promotion", inputSignals, decision, "success");
        } else if (data.agentType === "recommendation") {
          const recData = data as RecommendationActivitySSEEvent;
          const inputSignals: RecommendationInputSignals = {
            productId: recData.productId,
            productName: recData.productName,
            cartItems: recData.cartItems ?? [],
          };

          if (recData.status === "pending") {
            // Create a pending event — shows "Generating" in the panel
            const localId = logAgentCall("recommendation", inputSignals);
            // Track so we can complete it when the result arrives
            pendingEventsRef.current.set(recData.id, localId);
          } else {
            // Build the decision from completed data
            const recommendations: RecommendationItem[] = (recData.recommendations ?? []).map(
              (rec) => ({
                productId: rec.productId ?? "",
                productName: rec.productName ?? "",
                rank: rec.rank,
                reasoning: rec.reasoning,
              })
            );

            const pipelineTrace: RecommendationPipelineTrace | undefined = recData.pipelineTrace
              ? {
                  candidatesFound: recData.pipelineTrace.candidatesFound ?? 0,
                  afterNliFilter: recData.pipelineTrace.afterNliFilter ?? 0,
                  finalRanked: recData.pipelineTrace.finalRanked ?? 0,
                }
              : undefined;

            const decision: RecommendationDecision = {
              recommendations,
              ...(recData.userIntent !== undefined && { userIntent: recData.userIntent }),
              ...(pipelineTrace !== undefined && { pipelineTrace }),
            };

            const status = recData.error ? "error" : "success";

            // Find and complete the pending event
            const pendingLocalId = pendingEventsRef.current.get(recData.id);
            if (pendingLocalId) {
              completeAgentCall(pendingLocalId, status, decision, recData.error);
              pendingEventsRef.current.delete(recData.id);
            } else {
              // No pending event — create a completed event directly (race/reconnect)
              const localId = logAgentCall("recommendation", inputSignals);
              completeAgentCall(localId, status, decision, recData.error);
            }
          }
        }
      } catch (error) {
        console.error("[useCheckoutEvents] Failed to parse agent activity event:", error);
      }
    },
    [addAgentEvent, logAgentCall, completeAgentCall]
  );

  useEffect(() => {
    // EventSource is only available in browser environment
    if (typeof EventSource === "undefined") {
      return;
    }

    // Connect to SSE endpoint
    const eventSource = new EventSource(`${mcpServerUrl}/events`);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("checkout", handleCheckoutEvent);
    eventSource.addEventListener("agent_activity", handleAgentActivityEvent);

    eventSource.onerror = () => {
      // EventSource will automatically reconnect
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [mcpServerUrl, handleCheckoutEvent, handleAgentActivityEvent]);
}

/**
 * Infer competition position from reason codes
 */
function inferCompetitionPosition(
  reasonCodes: string[]
): "above_market" | "at_market" | "below_market" | "unknown" {
  if (reasonCodes.includes("ABOVE_MARKET")) return "above_market";
  if (reasonCodes.includes("BELOW_MARKET")) return "below_market";
  if (reasonCodes.includes("AT_MARKET")) return "at_market";
  return "unknown";
}
