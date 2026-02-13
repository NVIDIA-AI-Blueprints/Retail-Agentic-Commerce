"use client";

import { useEffect, useRef, useCallback } from "react";
import { useACPLog, type ACPEvent, type ACPEventType } from "@/hooks/useACPLog";
import { useCheckoutEvents } from "@/hooks/useCheckoutEvents";
import type { CheckoutProtocol } from "@/types";

/**
 * MCP Server base URL - uses nginx proxy in Docker, direct in development
 */
const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || "http://localhost:2091";

/**
 * Get display info for event types
 */
function getEventTypeInfo(type: ACPEventType): {
  label: string;
  tagClass: string;
  icon: string;
} {
  switch (type) {
    case "session_create":
      return { label: "CREATE", tagClass: "glass-tag green", icon: "+" };
    case "session_update":
      return { label: "UPDATE", tagClass: "glass-tag", icon: "↻" };
    case "delegate_payment":
      return { label: "DELEGATE", tagClass: "glass-tag yellow", icon: "🔐" };
    case "session_complete":
      return { label: "COMPLETE", tagClass: "glass-tag green", icon: "✓" };
    case "webhook_post":
      return { label: "WEBHOOK", tagClass: "glass-tag green", icon: "📤" };
  }
}

/**
 * Format timestamp to readable time
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Single ACP Event Item in the timeline (glass style)
 */
function ACPEventItem({ event }: { event: ACPEvent }) {
  const typeInfo = getEventTypeInfo(event.type);
  const isPending = event.status === "pending";
  const isError = event.status === "error";

  return (
    <div className="glass-event">
      <div className="time">{formatTime(event.timestamp)}</div>
      <div className="msg">
        {isPending ? (
          <span style={{ color: "var(--text-muted)" }}>Processing request...</span>
        ) : (
          <>
            <div
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>{event.method}</span>{" "}
              <span style={{ color: "var(--text-secondary)" }}>{event.endpoint}</span>
            </div>
            {event.responseSummary && (
              <span
                style={{
                  display: "block",
                  marginTop: "4px",
                  color: isError ? "#FF6B6B" : "var(--accent-green)",
                }}
              >
                {isError ? "✗" : "✓"} {event.responseSummary}
              </span>
            )}
            {event.duration != null && event.duration > 0 && (
              <span
                style={{
                  display: "block",
                  marginTop: "2px",
                  color: "var(--text-faint)",
                  fontSize: "11px",
                }}
              >
                {event.duration}ms
              </span>
            )}
          </>
        )}
      </div>
      <div className={isError ? "glass-tag" : typeInfo.tagClass}>
        {isPending ? "PENDING" : isError ? "ERROR" : typeInfo.label}
      </div>
    </div>
  );
}

/**
 * Empty state with waiting message
 */
function EmptyState({ protocol }: { protocol: CheckoutProtocol }) {
  const protocolLabel = protocol === "ucp" ? "UCP" : "ACP";

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
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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
        No active session
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: "12px",
          color: "var(--text-muted)",
          lineHeight: "1.45",
          maxWidth: "240px",
        }}
      >
        Select a product from the Client Agent panel to start a checkout session using{" "}
        {protocolLabel}.
      </p>
    </div>
  );
}

/**
 * Active session view with event timeline (glass style)
 */
function ActiveSession({
  events,
  onClear,
  protocol,
}: {
  events: ACPEvent[];
  onClear: () => void;
  protocol: CheckoutProtocol;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new events arrive (newest first)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events.length]);

  const protocolLabel = protocol === "ucp" ? "UCP" : "ACP";

  return (
    <div
      className="glass-content"
      style={{ display: "flex", flexDirection: "column", gap: "14px" }}
    >
      {/* Header with request count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.80)",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
          }}
        >
          {protocolLabel} Communication
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {events.length} request{events.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={onClear}
            style={{
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: "500",
              color: "var(--text-muted)",
              background: "var(--block-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--glass-border)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--block-bg)";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
            title="Clear all logs"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={scrollRef}
        className="glass-timeline"
        style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}
      >
        {[...events].reverse().map((event) => (
          <ACPEventItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

function ProtocolToggle({
  protocol,
  onProtocolChange,
}: {
  protocol: CheckoutProtocol;
  onProtocolChange: (protocol: CheckoutProtocol) => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: "4px",
        padding: "4px",
        borderRadius: "10px",
        border: "1px solid var(--glass-border-subtle, rgba(255, 255, 255, 0.08))",
        background: "var(--block-bg, rgba(255, 255, 255, 0.045))",
      }}
      role="tablist"
      aria-label="Protocol selector"
    >
      {(["acp", "ucp"] as const).map((tab) => {
        const active = protocol === tab;
        return (
          <button
            key={tab}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onProtocolChange(tab)}
            style={{
              minWidth: "52px",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.4px",
              color: active ? "var(--accent-green, #76b900)" : "var(--text-muted)",
              background: active
                ? "var(--accent-green-bg, rgba(118, 185, 0, 0.12))"
                : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            {tab.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Right panel showing merchant/retailer view with ACP communication log
 * Uses glassmorphic design system
 */
interface BusinessPanelProps {
  protocol: CheckoutProtocol;
  onProtocolChange: (protocol: CheckoutProtocol) => void;
}

export function BusinessPanel({ protocol, onProtocolChange }: BusinessPanelProps) {
  const { state, clear } = useACPLog();
  const hasEvents = state.events.length > 0;

  // Subscribe to SSE checkout events from MCP server
  // This allows the widget to remain isolated (no postMessage)
  useCheckoutEvents();

  // Clear local ACP log state and server-side event store
  // Note: Agent Activity is cleared by switching tabs or refreshing the page
  const handleClear = useCallback(async () => {
    // Clear local state first for immediate UI feedback
    clear();

    // Also clear server-side event store (fire and forget, ignore errors)
    try {
      await fetch(`${MCP_SERVER_URL}/events`, { method: "DELETE" });
    } catch {
      // Silently ignore - server may not be running
    }
  }, [clear]);

  const handleProtocolChange = useCallback(
    (nextProtocol: CheckoutProtocol) => {
      if (nextProtocol === protocol) {
        return;
      }
      clear();
      onProtocolChange(nextProtocol);
    },
    [clear, onProtocolChange, protocol]
  );

  return (
    <section
      className="glass-panel flex-1 flex flex-col h-full overflow-hidden"
      aria-label="Merchant Panel"
    >
      {/* Glass Panel Header */}
      <div className="glass-panel-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div className={`glass-badge ${hasEvents ? "yellow" : "gray"}`}>
            <span className={`glass-dot ${hasEvents ? "live" : ""}`}></span>
            Merchant Server
          </div>
          <ProtocolToggle protocol={protocol} onProtocolChange={handleProtocolChange} />
        </div>
      </div>

      {/* Content - either empty state or active session */}
      {state.events.length === 0 ? (
        <EmptyState protocol={protocol} />
      ) : (
        <ActiveSession events={state.events} onClear={handleClear} protocol={protocol} />
      )}
    </section>
  );
}
