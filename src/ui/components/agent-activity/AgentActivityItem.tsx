"use client";

import { useState } from "react";
import type {
  AgentActivityEvent,
  AgentType,
  PromotionInputSignals,
  PromotionDecision,
  PostPurchaseInputSignals,
  PostPurchaseDecision,
  RecommendationInputSignals,
  RecommendationDecision,
} from "@/types";

/**
 * Type guards for discriminating event types
 */
function isPromotionEvent(event: AgentActivityEvent): event is AgentActivityEvent & {
  inputSignals: PromotionInputSignals;
  decision?: PromotionDecision;
} {
  return event.agentType === "promotion";
}

function isPostPurchaseEvent(event: AgentActivityEvent): event is AgentActivityEvent & {
  inputSignals: PostPurchaseInputSignals;
  decision?: PostPurchaseDecision;
} {
  return event.agentType === "post_purchase";
}

function isRecommendationEvent(event: AgentActivityEvent): event is AgentActivityEvent & {
  inputSignals: RecommendationInputSignals;
  decision?: RecommendationDecision;
} {
  return event.agentType === "recommendation";
}

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
 * Post-Purchase Card - displays shipping message from post-purchase agent
 */
function PostPurchaseCard({
  event,
  isLast,
}: {
  event: AgentActivityEvent & {
    inputSignals: PostPurchaseInputSignals;
    decision?: PostPurchaseDecision;
  };
  isLast: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const typeInfo = getAgentTypeInfo(event.agentType);
  const isPending = event.status === "pending";
  const isError = event.status === "error";
  const isSuccess = event.status === "success" && event.decision;

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div style={{ marginBottom: isLast ? 0 : "12px" }}>
      <div className={`glass-decision ${isSuccess ? "highlight" : ""}`}>
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
            {typeInfo.label} Message
          </div>
          <div className={`glass-pill ${isPending ? "yellow" : isError ? "" : "green"}`}>
            {isPending ? "Generating" : isError ? "Error" : "Sent"}
          </div>
        </div>

        {/* Order ID */}
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

        {/* Subject Line */}
        {event.decision && (
          <div
            style={{
              marginTop: "10px",
              color: "var(--text-primary)",
              fontSize: "13px",
              fontWeight: "600",
              lineHeight: "1.35",
            }}
          >
            {event.decision.subject}
          </div>
        )}

        {/* Message Preview */}
        {event.decision && (
          <div
            style={{
              marginTop: "8px",
              color: "var(--text-muted)",
              fontSize: "12px",
              lineHeight: "1.45",
              whiteSpace: "pre-wrap",
              maxHeight: isExpanded ? "none" : "60px",
              overflow: "hidden",
            }}
          >
            {event.decision.message}
          </div>
        )}

        {isPending && (
          <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "10px" }}>
            Generating personalized confirmation message...
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
        {!isPending && event.decision && (
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
              <span>{isExpanded ? "Less" : "More"}</span>
            </button>
          </div>
        )}

        {/* Expandable details panel */}
        {isExpanded && !isPending && event.decision && (
          <div className="glass-details" style={{ display: "block" }}>
            <div className="glass-kv">
              <div className="k">Order ID</div>
              <div className="v">{event.inputSignals.orderId}</div>
              <div className="k">Customer</div>
              <div className="v">{event.inputSignals.customerName}</div>
              <div className="k">Status</div>
              <div className="v" style={{ textTransform: "capitalize" }}>
                {event.inputSignals.status.replace(/_/g, " ")}
              </div>
              <div className="k">Tone</div>
              <div className="v" style={{ textTransform: "capitalize" }}>
                {event.inputSignals.tone}
              </div>
              <div className="k">Language</div>
              <div className="v" style={{ textTransform: "uppercase" }}>
                {event.decision.language}
              </div>
              {event.duration !== undefined && (
                <>
                  <div className="k">Generation time</div>
                  <div className="v">{formatDuration(event.duration)}</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Recommendation Card - displays recommendations from ARAG agent
 */
function RecommendationCard({
  event,
  isLast,
}: {
  event: AgentActivityEvent & {
    inputSignals: RecommendationInputSignals;
    decision?: RecommendationDecision;
  };
  isLast: boolean;
}) {
  const typeInfo = getAgentTypeInfo(event.agentType);
  const isPending = event.status === "pending";
  const isError = event.status === "error";
  const isSuccess = event.status === "success" && event.decision;

  const recommendationCount = event.decision?.recommendations?.length ?? 0;

  return (
    <div style={{ marginBottom: isLast ? 0 : "12px" }}>
      <div className={`glass-decision ${isSuccess ? "highlight" : ""}`}>
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
            {typeInfo.label} Agent
          </div>
          <div className={`glass-pill ${isPending ? "yellow" : isError ? "" : "green"}`}>
            {isPending ? "Generating" : isError ? "Error" : `${recommendationCount} items`}
          </div>
        </div>

        {/* Product that triggered the request */}
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

        {/* User Intent */}
        {event.decision?.userIntent && (
          <div
            style={{
              marginTop: "10px",
              color: "var(--text-muted)",
              fontSize: "12px",
              lineHeight: "1.35",
            }}
          >
            {event.decision.userIntent}
          </div>
        )}

        {/* Recommendations List */}
        {event.decision?.recommendations && event.decision.recommendations.length > 0 && (
          <div style={{ marginTop: "12px" }}>
            {event.decision.recommendations.map((rec, index) => (
              <div
                key={rec.productId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 0",
                  borderTop: index === 0 ? "none" : "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "rgba(118, 185, 0, 0.15)",
                    color: "rgba(118, 185, 0, 0.9)",
                    fontSize: "11px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {rec.rank}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: "12px", fontWeight: "500", color: "var(--text-primary)" }}
                  >
                    {rec.productName}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      marginTop: "2px",
                      lineHeight: "1.3",
                    }}
                  >
                    {rec.reasoning}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isPending && (
          <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "10px" }}>
            Generating personalized recommendations...
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
      </div>
    </div>
  );
}

/**
 * Decision Card - displays a single agent decision with glass design
 */
export function AgentActivityItem({ event, isLast }: AgentActivityItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const typeInfo = getAgentTypeInfo(event.agentType);
  const isPending = event.status === "pending";
  const isError = event.status === "error";

  // Handle post-purchase events with specialized card
  if (isPostPurchaseEvent(event)) {
    return <PostPurchaseCard event={event} isLast={isLast} />;
  }

  // Handle recommendation events with specialized card
  if (isRecommendationEvent(event)) {
    return <RecommendationCard event={event} isLast={isLast} />;
  }

  // Only process promotion events from here
  if (!isPromotionEvent(event)) {
    return null;
  }

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  // Get outcome info (only for promotion events)
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

        {/* Agent's reasoning - shows LLM reasoning */}
        {llmReasoning && !isPending && !isError && (
          <div className="glass-section">
            <h3>Agent&apos;s reasoning</h3>
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
