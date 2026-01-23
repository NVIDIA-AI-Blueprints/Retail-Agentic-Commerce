"use client";

import { useState } from "react";
import type { AgentActivityEvent, AgentType } from "@/types";

/**
 * Get display info for agent types
 */
function getAgentTypeInfo(type: AgentType): {
  label: string;
  icon: string;
} {
  switch (type) {
    case "promotion":
      return { label: "Promotion", icon: "%" };
    case "recommendation":
      return { label: "Recommendation", icon: "★" };
    case "post_purchase":
      return { label: "Post-Purchase", icon: "✉" };
  }
}

/**
 * Get human-readable action label and percentage
 */
function getActionInfo(action: string): {
  label: string;
  percentage: number;
  shortLabel: string;
} {
  switch (action) {
    case "DISCOUNT_5_PCT":
      return { label: "5% discount applied", percentage: 5, shortLabel: "5% off" };
    case "DISCOUNT_10_PCT":
      return { label: "10% discount applied", percentage: 10, shortLabel: "10% off" };
    case "DISCOUNT_15_PCT":
      return { label: "15% discount applied", percentage: 15, shortLabel: "15% off" };
    case "FREE_SHIPPING":
      return { label: "Free shipping applied", percentage: 0, shortLabel: "Free shipping" };
    case "NO_PROMO":
      return { label: "No promotion applied", percentage: 0, shortLabel: "No discount" };
    default:
      return { label: action, percentage: 0, shortLabel: action };
  }
}

/**
 * Get human-readable outcome for promotion actions
 */
function getOutcomeInfo(
  action: string,
  amount: number
): {
  label: string;
  valueText: string;
  isPositive: boolean;
  actionInfo: ReturnType<typeof getActionInfo>;
} {
  const formattedAmount = `$${(amount / 100).toFixed(2)}`;
  const actionInfo = getActionInfo(action);

  switch (action) {
    case "DISCOUNT_5_PCT":
    case "DISCOUNT_10_PCT":
    case "DISCOUNT_15_PCT":
      return {
        label: `${actionInfo.label} based on current checkout context.`,
        valueText: `−${formattedAmount}`,
        isPositive: true,
        actionInfo,
      };
    case "FREE_SHIPPING":
      return { label: "Free shipping applied", valueText: "Free", isPositive: true, actionInfo };
    case "NO_PROMO":
      return {
        label: "No promotion was applied — the agent determined pricing was already optimal.",
        valueText: "$0.00",
        isPositive: false,
        actionInfo,
      };
    default:
      return { label: action, valueText: "$0.00", isPositive: false, actionInfo };
  }
}

/**
 * Format duration to human-readable time
 */
function formatDuration(ms: number | undefined): string {
  if (ms === undefined) return "—";
  return `${ms} ms`;
}

/**
 * Format currency from cents
 */
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface AgentActivityItemProps {
  event: AgentActivityEvent;
  isLast: boolean;
}

/**
 * Decision Card - displays a single agent decision with glass design
 */
export function AgentActivityItem({ event, isLast }: AgentActivityItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const typeInfo = getAgentTypeInfo(event.agentType);
  const isPending = event.status === "pending";
  const isError = event.status === "error";

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  // Get outcome info
  const outcomeInfo = event.decision
    ? getOutcomeInfo(event.decision.action, event.decision.discountAmount)
    : null;

  // Get the LLM reasoning - this is the actual explanation from the agent
  const llmReasoning = event.decision?.reasoning;

  // Determine card style
  const isHighlight = outcomeInfo?.isPositive && !isError && !isPending;

  return (
    <div style={{ marginBottom: isLast ? 0 : "12px" }}>
      {/* Decision Card */}
      <div className={`glass-decision ${isHighlight ? "highlight" : ""}`}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <div className="glass-kicker">
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: isPending
                  ? "rgba(255, 255, 255, 0.4)"
                  : isError
                    ? "#FF6B6B"
                    : "rgba(118, 185, 0, 0.9)",
                boxShadow: isPending
                  ? "none"
                  : isError
                    ? "0 0 0 4px rgba(255, 107, 107, 0.12)"
                    : "0 0 0 4px rgba(118, 185, 0, 0.12)",
                display: "inline-block",
              }}
            ></span>
            {typeInfo.label} Decision
          </div>
          <div
            className={`glass-pill ${isPending ? "yellow" : isError ? "" : outcomeInfo?.isPositive ? "green" : ""}`}
          >
            {isPending
              ? "Evaluating"
              : isError
                ? "Error"
                : outcomeInfo?.isPositive
                  ? "Applied"
                  : "No change"}
          </div>
        </div>

        {/* Product Name */}
        <div
          style={{
            marginTop: "8px",
            fontSize: "13px",
            color: "var(--text-secondary)",
            fontWeight: "650",
          }}
        >
          {event.inputSignals.productName}
        </div>

        {/* Summary and Value */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginTop: "10px",
            gap: "12px",
          }}
        >
          <div style={{ color: "var(--text-muted)", fontSize: "12px", lineHeight: "1.35" }}>
            {isPending
              ? "Gathering context from the cart, inventory, and market signals…"
              : outcomeInfo?.label || "Processing..."}
          </div>
          <div className={`glass-value ${outcomeInfo?.isPositive ? "positive" : ""}`}>
            {outcomeInfo?.valueText || "$0.00"}
          </div>
        </div>

        {/* Why this happened - shows LLM reasoning */}
        {llmReasoning && !isPending && !isError && (
          <div className="glass-section">
            <h3>Why this happened</h3>
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: "12px",
                lineHeight: "1.45",
              }}
            >
              {llmReasoning}
            </p>
          </div>
        )}

        {/* Error message */}
        {isError && event.error && (
          <div
            style={{
              marginTop: "12px",
              padding: "10px 12px",
              borderRadius: "14px",
              border: "1px solid rgba(255, 107, 107, 0.25)",
              background: "rgba(255, 107, 107, 0.08)",
              fontSize: "12px",
              color: "#FF6B6B",
            }}
          >
            {event.error}
          </div>
        )}

        {/* Details toggle */}
        {!isPending && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginTop: "12px",
            }}
          >
            <button
              className="glass-details-toggle"
              onClick={toggleExpanded}
              aria-expanded={isExpanded}
              type="button"
            >
              <span className="glass-chevron"></span>
              <span>Details</span>
            </button>
          </div>
        )}

        {/* Expandable details panel */}
        {isExpanded && !isPending && (
          <div className="glass-details" style={{ display: "block" }}>
            <div className="glass-kv">
              <div className="k">Stock level</div>
              <div className="v">{event.inputSignals.stockCount} units</div>
              <div className="k">Base price</div>
              <div className="v">{formatCurrency(event.inputSignals.basePrice)}</div>
              {event.inputSignals.competitorPrice && (
                <>
                  <div className="k">Market reference</div>
                  <div className="v">{formatCurrency(event.inputSignals.competitorPrice)}</div>
                </>
              )}
              <div className="k">Inventory state</div>
              <div className="v">
                {event.inputSignals.inventoryPressure === "high" ? "High" : "Normal"}
              </div>
              <div className="k">Price position</div>
              <div className="v">
                {event.inputSignals.competitionPosition === "above_market"
                  ? "Above market"
                  : event.inputSignals.competitionPosition === "below_market"
                    ? "Below market"
                    : event.inputSignals.competitionPosition === "at_market"
                      ? "At market"
                      : "Unknown"}
              </div>
              {event.duration !== undefined && (
                <>
                  <div className="k">Time to decide</div>
                  <div className="v">{formatDuration(event.duration)}</div>
                </>
              )}
            </div>
            {event.decision?.reasonCodes && event.decision.reasonCodes.length > 0 && (
              <>
                <div className="glass-divider"></div>
                <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                  <span style={{ fontWeight: "500" }}>Reason codes: </span>
                  {event.decision.reasonCodes.join(", ")}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
