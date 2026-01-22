import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AgentActivityItem } from "./AgentActivityItem";
import type { AgentActivityEvent } from "@/types";

describe("AgentActivityItem", () => {
  const baseEvent: AgentActivityEvent = {
    id: "agent_123_abc",
    timestamp: new Date("2024-01-15T10:30:00Z"),
    status: "success",
    agentType: "promotion",
    inputSignals: {
      productId: "prod_123",
      productName: "Classic T-Shirt",
      stockCount: 100,
      basePrice: 2500,
      competitorPrice: 2800,
      inventoryPressure: "high",
      competitionPosition: "below_market",
    },
    decision: {
      action: "DISCOUNT_10_PCT",
      discountAmount: 250,
      reasonCodes: ["HIGH_INVENTORY", "BELOW_MARKET"],
      reasoning: "High inventory and below market price suggest a discount is appropriate.",
    },
    duration: 150,
  };

  it("renders the product name", () => {
    render(<AgentActivityItem event={baseEvent} isLast={false} />);
    expect(screen.getByText("Classic T-Shirt")).toBeInTheDocument();
  });

  it("renders the PROMOTION badge", () => {
    render(<AgentActivityItem event={baseEvent} isLast={false} />);
    expect(screen.getByText("PROMOTION")).toBeInTheDocument();
  });

  it("renders the discount action badge", () => {
    render(<AgentActivityItem event={baseEvent} isLast={false} />);
    expect(screen.getByText("10% OFF")).toBeInTheDocument();
  });

  it("renders discount amount", () => {
    render(<AgentActivityItem event={baseEvent} isLast={false} />);
    expect(screen.getByText("-$2.50")).toBeInTheDocument();
  });

  it("renders reason codes as pills", () => {
    render(<AgentActivityItem event={baseEvent} isLast={false} />);
    expect(screen.getByText("HIGH INVENTORY")).toBeInTheDocument();
    expect(screen.getByText("BELOW MARKET")).toBeInTheDocument();
  });

  it("expands to show details when clicked", () => {
    render(<AgentActivityItem event={baseEvent} isLast={false} />);

    // Initially details are hidden
    expect(screen.queryByText("Input Signals")).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByText("Show details"));

    // Now details should be visible
    expect(screen.getByText("Input Signals")).toBeInTheDocument();
    expect(screen.getByText("Agent Reasoning")).toBeInTheDocument();
    expect(screen.getByText("100 units")).toBeInTheDocument();
    expect(screen.getByText("$25.00")).toBeInTheDocument();
    expect(screen.getByText("$28.00")).toBeInTheDocument();
  });

  it("renders NO_PROMO action correctly", () => {
    const noPromoEvent: AgentActivityEvent = {
      ...baseEvent,
      decision: {
        action: "NO_PROMO",
        discountAmount: 0,
        reasonCodes: [],
        reasoning: "No promotion needed.",
      },
    };
    render(<AgentActivityItem event={noPromoEvent} isLast={false} />);
    expect(screen.getByText("NO PROMO")).toBeInTheDocument();
  });

  it("renders pending status with animation", () => {
    const { decision: _, ...baseEventWithoutDecision } = baseEvent;
    const pendingEvent: AgentActivityEvent = {
      ...baseEventWithoutDecision,
      status: "pending",
    };
    render(<AgentActivityItem event={pendingEvent} isLast={false} />);
    // The component should still render without errors
    expect(screen.getByText("Classic T-Shirt")).toBeInTheDocument();
  });

  it("renders error status correctly", () => {
    const { decision: _, ...baseEventWithoutDecision } = baseEvent;
    const errorEvent: AgentActivityEvent = {
      ...baseEventWithoutDecision,
      status: "error",
      error: "Agent timeout",
    };
    render(<AgentActivityItem event={errorEvent} isLast={false} />);

    // Expand to see error
    fireEvent.click(screen.getByText("Show details"));
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Agent timeout")).toBeInTheDocument();
  });

  it("renders duration when available", () => {
    render(<AgentActivityItem event={baseEvent} isLast={false} />);
    expect(screen.getByText("150ms")).toBeInTheDocument();
  });
});
