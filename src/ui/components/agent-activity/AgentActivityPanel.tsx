"use client";

import { useEffect, useRef } from "react";
import { useAgentActivityLog } from "@/hooks/useAgentActivityLog";
import { AgentActivityItem } from "./AgentActivityItem";
import type { AgentActivityEvent, PromotionDecision, PostPurchaseDecision } from "@/types";

/**
 * Type guard for promotion decision
 */
function isPromotionDecision(
  decision: PromotionDecision | PostPurchaseDecision
): decision is PromotionDecision {
  return "action" in decision && "discountAmount" in decision;
}

/**
 * Convert action code to human-readable text for timeline display
 */
function getHumanReadableAction(action: string): string {
  switch (action) {
    case "DISCOUNT_5_PCT":
      return "Applied 5% discount";
    case "DISCOUNT_10_PCT":
      return "Applied 10% discount";
    case "DISCOUNT_15_PCT":
      return "Applied 15% discount";
    case "FREE_SHIPPING":
      return "Applied free shipping";
    case "NO_PROMO":
      return "No promotion needed";
    default:
      return action;
  }
}

/**
 * Get timeline message for an event
 */
function getTimelineMessage(event: AgentActivityEvent): string {
  // Get product name from input signals - all signal types have productName
  const productName =
    "productName" in event.inputSignals
      ? (event.inputSignals as { productName: string }).productName
      : "Unknown";

  if (event.status === "pending") {
    return event.agentType === "post_purchase"
      ? `Generating message for ${productName}...`
      : `Evaluating ${productName}...`;
  }

  if (event.agentType === "post_purchase") {
    if (event.status === "success" && event.decision) {
      return `Generated confirmation for ${productName}`;
    }
    return `Failed to generate message for ${productName}`;
  }

  // Promotion events
  if (event.decision && isPromotionDecision(event.decision)) {
    return `${getHumanReadableAction(event.decision.action)} for ${productName}`;
  }

  return `Processed ${productName}`;
}

/**
 * Empty state - shows agent waiting state
 */
function EmptyState() {
  return (
    <div
      className="glass-content"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: "var(--block-bg)",
          border: "1px solid var(--glass-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--text-muted)" }}
        >
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h3
        style={{
          margin: "0 0 8px",
          fontSize: "14px",
          fontWeight: "600",
          color: "var(--text-secondary)",
        }}
      >
        Waiting to observe
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: "12px",
          color: "var(--text-muted)",
          lineHeight: "1.45",
          maxWidth: "260px",
        }}
      >
        When you start a checkout, the AI agent will evaluate the context and make real-time
        decisions here.
      </p>
    </div>
  );
}

/**
 * Get agent state label
 */
function getAgentState(events: ReturnType<typeof useAgentActivityLog>["state"]["events"]): {
  label: string;
  pillClass: string;
} {
  if (events.length === 0) return { label: "Idle", pillClass: "glass-pill green" };
  const lastEvent = events[events.length - 1];
  if (!lastEvent) return { label: "Idle", pillClass: "glass-pill green" };
  if (lastEvent.status === "pending") return { label: "Reasoning", pillClass: "glass-pill green" };
  if (lastEvent.status === "error") return { label: "Error", pillClass: "glass-pill" };
  return { label: "Complete", pillClass: "glass-pill green" };
}

/**
 * Active session view with agent activity decisions
 */
function ActiveAgentActivity() {
  const { state } = useAgentActivityLog();
  const scrollRef = useRef<HTMLDivElement>(null);
  const agentState = getAgentState(state.events);

  // Auto-scroll to top when new events arrive (newest first)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [state.events.length]);

  return (
    <div className="glass-content">
      {/* Title Section */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "16px",
              letterSpacing: "0.2px",
              color: "var(--text-primary)",
            }}
          >
            Autonomous Decisions
          </h2>
        </div>
        <div className={agentState.pillClass}>{agentState.label}</div>
      </div>

      {/* Decision cards */}
      <div ref={scrollRef} style={{ maxHeight: "calc(100vh - 350px)", overflowY: "auto" }}>
        {state.events.map((event, index) => (
          <AgentActivityItem
            key={event.id}
            event={event}
            isLast={index === state.events.length - 1}
          />
        ))}
      </div>

      {/* Timeline */}
      <div className="glass-section">
        <h3>Agent Timeline</h3>
        <div className="glass-timeline" style={{ maxHeight: "200px", overflowY: "auto" }}>
          {[...state.events].reverse().map((event) => (
            <div key={`timeline-${event.id}`} className="glass-event">
              <div className="time">
                {event.timestamp.toLocaleTimeString("en-US", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </div>
              <div className="msg">{getTimelineMessage(event)}</div>
              <div
                className={`glass-tag ${event.status === "success" ? "green" : event.status === "error" ? "" : "yellow"}`}
              >
                {event.status === "pending"
                  ? "EVALUATING"
                  : event.status === "success"
                    ? "DECIDED"
                    : event.status === "error"
                      ? "ERROR"
                      : "SKIPPED"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Agent Activity Panel - displays agent decisions and reasoning
 * This panel shows how the AI agent evaluates context and makes decisions
 * Uses glassmorphic design system
 */
export function AgentActivityPanel() {
  const { state } = useAgentActivityLog();
  const hasEvents = state.events.length > 0;

  return (
    <section
      className="glass-panel flex-1 flex flex-col h-full overflow-hidden"
      aria-label="Agent Activity Panel"
    >
      {/* Glass Panel Header */}
      <div className="glass-panel-header">
        <div className={`glass-badge ${hasEvents ? "green" : "gray"}`}>
          <span className={`glass-dot ${hasEvents ? "live" : ""}`}></span>
          Agent Activity
        </div>
      </div>

      {/* Content - either empty state or active session */}
      {state.events.length === 0 ? <EmptyState /> : <ActiveAgentActivity />}
    </section>
  );
}
