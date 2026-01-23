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

  it("renders the Promotion Decision kicker", () => {
    render(<AgentActivityItem event={baseEvent} isLast={false} />);
    expect(screen.getByText("Promotion Decision")).toBeInTheDocument();
  });

  it("renders Applied status pill for positive outcomes", () => {
    render(<AgentActivityItem event={baseEvent} isLast={false} />);
    expect(screen.getByText("Applied")).toBeInTheDocument();
  });

  it("renders the discount value", () => {
    render(<AgentActivityItem event={baseEvent} isLast={false} />);
    expect(screen.getByText("−$2.50")).toBeInTheDocument();
  });

  it("renders 'Why this happened' with LLM reasoning", () => {
    render(<AgentActivityItem event={baseEvent} isLast={false} />);
    expect(screen.getByText("Why this happened")).toBeInTheDocument();
    // Should show the actual LLM reasoning from the decision
    expect(
      screen.getByText("High inventory and below market price suggest a discount is appropriate.")
    ).toBeInTheDocument();
  });

  it("expands to show technical details when clicked", () => {
    render(<AgentActivityItem event={baseEvent} isLast={false} />);

    // Click to expand using the Details button
    fireEvent.click(screen.getByText("Details"));

    // Now technical details should be visible (using glass-kv format)
    expect(screen.getByText("Stock level")).toBeInTheDocument();
    expect(screen.getByText("100 units")).toBeInTheDocument();
    expect(screen.getByText("Base price")).toBeInTheDocument();
    expect(screen.getByText("$25.00")).toBeInTheDocument();
    expect(screen.getByText("Market reference")).toBeInTheDocument();
    expect(screen.getByText("$28.00")).toBeInTheDocument();
    expect(screen.getByText("Time to decide")).toBeInTheDocument();
    expect(screen.getByText("150 ms")).toBeInTheDocument();
  });

  it("shows reason codes in expanded view", () => {
    render(<AgentActivityItem event={baseEvent} isLast={false} />);
    fireEvent.click(screen.getByText("Details"));
    // Details panel now shows reason codes instead of quoted reasoning
    expect(screen.getByText("Reason codes:")).toBeInTheDocument();
    expect(screen.getByText("HIGH_INVENTORY, BELOW_MARKET")).toBeInTheDocument();
  });

  it("renders NO_PROMO outcome correctly", () => {
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
    expect(
      screen.getByText(
        "No promotion was applied — the agent determined pricing was already optimal."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("No change")).toBeInTheDocument();
  });

  it("renders pending status with evaluating message", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { decision: _unused, ...baseEventWithoutDecision } = baseEvent;
    const pendingEvent: AgentActivityEvent = {
      ...baseEventWithoutDecision,
      status: "pending",
    };
    render(<AgentActivityItem event={pendingEvent} isLast={false} />);
    expect(screen.getByText("Evaluating")).toBeInTheDocument();
    expect(screen.getByText("Classic T-Shirt")).toBeInTheDocument();
    expect(
      screen.getByText("Gathering context from the cart, inventory, and market signals…")
    ).toBeInTheDocument();
  });

  it("renders error status with error styling", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { decision: _unused, ...baseEventWithoutDecision } = baseEvent;
    const errorEvent: AgentActivityEvent = {
      ...baseEventWithoutDecision,
      status: "error",
      error: "Agent timeout",
    };
    render(<AgentActivityItem event={errorEvent} isLast={false} />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    // Error message should be visible directly (not hidden)
    expect(screen.getByText("Agent timeout")).toBeInTheDocument();
  });

  it("displays 'Above market' position in expanded details", () => {
    const aboveMarketEvent: AgentActivityEvent = {
      ...baseEvent,
      inputSignals: {
        ...baseEvent.inputSignals,
        competitionPosition: "above_market",
      },
    };
    render(<AgentActivityItem event={aboveMarketEvent} isLast={false} />);
    // Click to expand details
    fireEvent.click(screen.getByText("Details"));
    // Check that the price position shows "Above market" in the details
    expect(screen.getByText("Price position")).toBeInTheDocument();
    expect(screen.getByText("Above market")).toBeInTheDocument();
  });

  it("does not show Details button when pending", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { decision: _unused, ...baseEventWithoutDecision } = baseEvent;
    const pendingEvent: AgentActivityEvent = {
      ...baseEventWithoutDecision,
      status: "pending",
    };
    render(<AgentActivityItem event={pendingEvent} isLast={false} />);
    expect(screen.queryByText("Details")).not.toBeInTheDocument();
  });
});
