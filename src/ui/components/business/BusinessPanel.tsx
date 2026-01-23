"use client";

import { useEffect, useRef } from "react";
import { useACPLog, type ACPEvent, type ACPEventType } from "@/hooks/useACPLog";

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
            <span style={{ color: "var(--text-muted)" }}>{event.method}</span>{" "}
            <span style={{ color: "var(--text-secondary)" }}>{event.endpoint}</span>
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
            {event.duration && (
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
        Select a product from the Client Agent panel to start an ACP checkout session.
      </p>
    </div>
  );
}

/**
 * Active session view with event timeline (glass style)
 */
function ActiveSession({ events }: { events: ACPEvent[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new events arrive (newest first)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events.length]);

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
          ACP Communication
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--accent-green)",
              animation: "glassPulse 1.6s infinite ease-out",
            }}
          ></span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {events.length} request{events.length !== 1 ? "s" : ""}
          </span>
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

/**
 * Right panel showing merchant/retailer view with ACP communication log
 * Uses glassmorphic design system
 */
export function BusinessPanel() {
  const { state } = useACPLog();
  const hasEvents = state.events.length > 0;

  return (
    <section
      className="glass-panel flex-1 flex flex-col h-full overflow-hidden"
      aria-label="Merchant Panel"
    >
      {/* Glass Panel Header */}
      <div className="glass-panel-header">
        <div className={`glass-badge ${hasEvents ? "yellow" : "gray"}`}>
          <span className={`glass-dot ${hasEvents ? "live" : ""}`}></span>
          Merchant Server
        </div>
      </div>

      {/* Content - either empty state or active session */}
      {state.events.length === 0 ? <EmptyState /> : <ActiveSession events={state.events} />}
    </section>
  );
}
