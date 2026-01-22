import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AgentActivityLogProvider, useAgentActivityLog } from "./useAgentActivityLog";
import type { PromotionInputSignals, PromotionDecision } from "@/types";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AgentActivityLogProvider>{children}</AgentActivityLogProvider>
);

describe("useAgentActivityLog", () => {
  const mockInputSignals: PromotionInputSignals = {
    productId: "prod_123",
    productName: "Test Product",
    stockCount: 100,
    basePrice: 2500,
    competitorPrice: 2800,
    inventoryPressure: "high",
    competitionPosition: "above_market",
  };

  const mockDecision: PromotionDecision = {
    action: "DISCOUNT_10_PCT",
    discountAmount: 250,
    reasonCodes: ["HIGH_INVENTORY"],
    reasoning: "High stock warrants discount",
  };

  it("throws error when used outside provider", () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      renderHook(() => useAgentActivityLog());
    }).toThrow("useAgentActivityLog must be used within AgentActivityLogProvider");

    console.error = originalError;
  });

  it("starts with empty events", () => {
    const { result } = renderHook(() => useAgentActivityLog(), { wrapper });
    expect(result.current.state.events).toHaveLength(0);
    expect(result.current.state.isActive).toBe(false);
  });

  it("adds an event with addAgentEvent", () => {
    const { result } = renderHook(() => useAgentActivityLog(), { wrapper });

    act(() => {
      result.current.addAgentEvent("promotion", mockInputSignals, mockDecision, "success");
    });

    expect(result.current.state.events).toHaveLength(1);
    expect(result.current.state.isActive).toBe(true);
    const event = result.current.state.events[0];
    expect(event).toBeDefined();
    expect(event!.agentType).toBe("promotion");
    expect(event!.status).toBe("success");
    expect(event!.inputSignals).toEqual(mockInputSignals);
    expect(event!.decision).toEqual(mockDecision);
  });

  it("logs and completes an agent call", () => {
    const { result } = renderHook(() => useAgentActivityLog(), { wrapper });

    let eventId: string;
    act(() => {
      eventId = result.current.logAgentCall("promotion", mockInputSignals);
    });

    expect(result.current.state.events).toHaveLength(1);
    const pendingEvent = result.current.state.events[0];
    expect(pendingEvent).toBeDefined();
    expect(pendingEvent!.status).toBe("pending");
    expect(pendingEvent!.decision).toBeUndefined();

    act(() => {
      result.current.completeAgentCall(eventId, "success", mockDecision);
    });

    const completedEvent = result.current.state.events[0];
    expect(completedEvent).toBeDefined();
    expect(completedEvent!.status).toBe("success");
    expect(completedEvent!.decision).toEqual(mockDecision);
    expect(completedEvent!.duration).toBeDefined();
  });

  it("clears all events", () => {
    const { result } = renderHook(() => useAgentActivityLog(), { wrapper });

    act(() => {
      result.current.addAgentEvent("promotion", mockInputSignals, mockDecision, "success");
      result.current.addAgentEvent("promotion", mockInputSignals, mockDecision, "success");
    });

    expect(result.current.state.events).toHaveLength(2);

    act(() => {
      result.current.clear();
    });

    expect(result.current.state.events).toHaveLength(0);
    expect(result.current.state.isActive).toBe(false);
  });

  it("handles error status correctly", () => {
    const { result } = renderHook(() => useAgentActivityLog(), { wrapper });

    let eventId: string;
    act(() => {
      eventId = result.current.logAgentCall("promotion", mockInputSignals);
    });

    act(() => {
      result.current.completeAgentCall(eventId, "error", undefined, "Agent timeout");
    });

    const errorEvent = result.current.state.events[0];
    expect(errorEvent).toBeDefined();
    expect(errorEvent!.status).toBe("error");
    expect(errorEvent!.error).toBe("Agent timeout");
    expect(errorEvent!.decision).toBeUndefined();
  });
});
