"use client";

import { useState } from "react";
import { Stack, Text, Badge, Flex } from "@kui/foundations-react-external";
import type { AgentActivityEvent, AgentType } from "@/types";

/**
 * Get display info for agent types
 */
function getAgentTypeInfo(type: AgentType): {
  label: string;
  color: "green" | "blue" | "purple" | "yellow" | "orange";
  icon: string;
} {
  switch (type) {
    case "promotion":
      return { label: "PROMOTION", color: "green", icon: "%" };
    case "recommendation":
      return { label: "RECOMMEND", color: "blue", icon: "★" };
    case "post_purchase":
      return { label: "POST-PURCHASE", color: "purple", icon: "✉" };
  }
}

/**
 * Get display info for promotion actions
 */
function getActionInfo(action: string): {
  label: string;
  color: "green" | "blue" | "yellow" | "red" | "gray";
} {
  switch (action) {
    case "DISCOUNT_5_PCT":
      return { label: "5% OFF", color: "green" };
    case "DISCOUNT_10_PCT":
      return { label: "10% OFF", color: "green" };
    case "DISCOUNT_15_PCT":
      return { label: "15% OFF", color: "green" };
    case "FREE_SHIPPING":
      return { label: "FREE SHIP", color: "blue" };
    case "NO_PROMO":
      return { label: "NO PROMO", color: "gray" };
    default:
      return { label: action, color: "gray" };
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
 * Single Agent Activity event item in the timeline
 */
export function AgentActivityItem({ event, isLast }: AgentActivityItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const typeInfo = getAgentTypeInfo(event.agentType);
  const isPending = event.status === "pending";
  const isError = event.status === "error";
  const isSkipped = event.status === "skipped";

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className="relative flex gap-4 pb-7">
      {/* Timeline connector */}
      {!isLast && (
        <div
          className="absolute left-[11px] top-[28px] w-[2px] h-[calc(100%-14px)]"
          style={{
            background: isPending
              ? "linear-gradient(to bottom, #404040, transparent)"
              : "#333333",
          }}
        />
      )}

      {/* Timeline dot */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
            ${isPending ? "bg-[#333333] animate-pulse" : isError ? "bg-red-900/50 border border-red-700" : isSkipped ? "bg-gray-800/50 border border-gray-600" : "bg-[#242424] border border-[#404040]"}`}
        >
          {isPending ? (
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
          ) : (
            <span
              className={
                isError ? "text-red-400" : isSkipped ? "text-gray-500" : "text-green-400"
              }
            >
              {isError ? "!" : typeInfo.icon}
            </span>
          )}
        </div>
      </div>

      {/* Event content */}
      <div className="flex-1 min-w-0">
        {/* Header with badge and time */}
        <Flex justify="between" align="center" className="mb-2">
          <Badge
            kind="solid"
            color={isError ? "red" : isSkipped ? "gray" : typeInfo.color}
            className="text-xs"
          >
            {typeInfo.label}
          </Badge>
          <Text kind="body/regular/sm" className="text-subtle">
            {formatTime(event.timestamp)}
          </Text>
        </Flex>

        {/* Product name */}
        <Text kind="body/regular/md" className="text-secondary mb-1.5">
          {event.inputSignals.productName}
        </Text>

        {/* Decision badge */}
        {event.decision && (
          <Flex align="center" gap="2" className="mb-2">
            <Badge
              kind="solid"
              color={getActionInfo(event.decision.action).color}
              className="text-xs"
            >
              {getActionInfo(event.decision.action).label}
            </Badge>
            {event.decision.discountAmount > 0 && (
              <Text kind="body/regular/sm" className="text-green-400">
                -{formatCurrency(event.decision.discountAmount)}
              </Text>
            )}
          </Flex>
        )}

        {/* Reason codes pills */}
        {event.decision && event.decision.reasonCodes.length > 0 && (
          <Flex gap="1" wrap="wrap" className="mb-2">
            {event.decision.reasonCodes.map((code, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-[#2a2a2a] text-gray-400 border border-[#404040]"
              >
                {code.replace(/_/g, " ")}
              </span>
            ))}
          </Flex>
        )}

        {/* Expandable section for details */}
        <button
          onClick={toggleExpanded}
          className="flex items-center gap-1 text-xs text-subtle hover:text-secondary transition-colors mt-2"
        >
          <span className="transform transition-transform duration-200">
            {isExpanded ? "▼" : "▶"}
          </span>
          {isExpanded ? "Hide details" : "Show details"}
        </button>

        {isExpanded && (
          <div className="mt-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#333333]">
            {/* Input Signals */}
            <Text kind="label/semibold/sm" className="text-subtle mb-2 block">
              Input Signals
            </Text>
            <Stack gap="1" className="mb-4">
              <Flex justify="between" className="text-xs">
                <span className="text-subtle">Stock Count:</span>
                <span className="text-secondary font-mono">
                  {event.inputSignals.stockCount} units
                </span>
              </Flex>
              <Flex justify="between" className="text-xs">
                <span className="text-subtle">Base Price:</span>
                <span className="text-secondary font-mono">
                  {formatCurrency(event.inputSignals.basePrice)}
                </span>
              </Flex>
              {event.inputSignals.competitorPrice && (
                <Flex justify="between" className="text-xs">
                  <span className="text-subtle">Competitor Price:</span>
                  <span className="text-secondary font-mono">
                    {formatCurrency(event.inputSignals.competitorPrice)}
                  </span>
                </Flex>
              )}
              <Flex justify="between" className="text-xs">
                <span className="text-subtle">Inventory Pressure:</span>
                <span
                  className={`font-mono ${event.inputSignals.inventoryPressure === "high" ? "text-yellow-400" : "text-gray-400"}`}
                >
                  {event.inputSignals.inventoryPressure.toUpperCase()}
                </span>
              </Flex>
              <Flex justify="between" className="text-xs">
                <span className="text-subtle">Competition Position:</span>
                <span
                  className={`font-mono ${
                    event.inputSignals.competitionPosition === "above_market"
                      ? "text-red-400"
                      : event.inputSignals.competitionPosition === "below_market"
                        ? "text-green-400"
                        : "text-gray-400"
                  }`}
                >
                  {event.inputSignals.competitionPosition.replace(/_/g, " ").toUpperCase()}
                </span>
              </Flex>
            </Stack>

            {/* Agent Reasoning */}
            {event.decision?.reasoning && (
              <>
                <Text kind="label/semibold/sm" className="text-subtle mb-2 block">
                  Agent Reasoning
                </Text>
                <Text
                  kind="body/regular/sm"
                  className="text-gray-400 italic leading-relaxed"
                >
                  &quot;{event.decision.reasoning}&quot;
                </Text>
              </>
            )}

            {/* Error message */}
            {event.error && (
              <>
                <Text kind="label/semibold/sm" className="text-red-400 mb-2 block">
                  Error
                </Text>
                <Text kind="body/regular/sm" className="text-red-400">
                  {event.error}
                </Text>
              </>
            )}
          </div>
        )}

        {/* Duration */}
        {event.duration !== undefined && !isPending && (
          <Text kind="body/regular/sm" className="text-subtle mt-1.5">
            {event.duration}ms
          </Text>
        )}
      </div>
    </div>
  );
}
