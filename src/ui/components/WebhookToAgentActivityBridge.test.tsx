import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor, act } from "@testing-library/react";
import { WebhookToAgentActivityBridge } from "./WebhookToAgentActivityBridge";

const addPostPurchaseEvent = vi.fn();
const logEvent = vi.fn(() => "acp_event_1");
const completeEvent = vi.fn();

vi.mock("@/hooks/useAgentActivityLog", () => ({
  useAgentActivityLog: () => ({
    addPostPurchaseEvent,
  }),
}));

vi.mock("@/hooks/useACPLog", () => ({
  useACPLog: () => ({
    logEvent,
    completeEvent,
  }),
}));

let mockEventSourceInstance: MockEventSource | null = null;

class MockEventSource {
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(url: string) {
    this.url = url;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    mockEventSourceInstance = this;
  }
  close() {
    // no-op
  }
}

describe("WebhookToAgentActivityBridge", () => {
  beforeEach(() => {
    addPostPurchaseEvent.mockClear();
    logEvent.mockClear();
    completeEvent.mockClear();
    mockEventSourceInstance = null;
    global.EventSource = MockEventSource as unknown as typeof EventSource;
    // Mock fetch for the DELETE call on mount
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("processes shipping_update events received via SSE", async () => {
    const shippingEvent = {
      id: "evt_1",
      type: "shipping_update",
      receivedAt: new Date().toISOString(),
      protocol: "acp",
      data: {
        type: "shipping_update",
        checkout_session_id: "checkout_123",
        order_id: "order_123",
        status: "order_shipped",
        language: "en",
        subject: "Your order is on the way",
        message: "Tracking details inside",
      },
    };

    render(<WebhookToAgentActivityBridge />);

    // Wait for EventSource to be created
    await waitFor(() => {
      expect(mockEventSourceInstance).not.toBeNull();
    });

    // Simulate SSE message
    act(() => {
      mockEventSourceInstance?.onmessage?.(
        new MessageEvent("message", { data: JSON.stringify(shippingEvent) })
      );
    });

    await waitFor(() => {
      expect(addPostPurchaseEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: "order_123",
          status: "order_shipped",
          language: "en",
        }),
        expect.objectContaining({
          subject: "Your order is on the way",
          message: "Tracking details inside",
        }),
        "success"
      );
    });

    expect(logEvent).toHaveBeenCalledWith(
      "webhook_post",
      "POST",
      "/api/webhooks/acp",
      "Shipping update: order_shipped"
    );
  });

  it("logs UCP webhook endpoint for UCP events", async () => {
    const shippingEvent = {
      id: "evt_2",
      type: "shipping_update",
      receivedAt: new Date().toISOString(),
      protocol: "ucp",
      data: {
        type: "shipping_update",
        checkout_session_id: "checkout_456",
        order_id: "order_456",
        status: "delivered",
        language: "en",
        subject: "Delivered",
        message: "Package delivered",
      },
    };

    render(<WebhookToAgentActivityBridge />);

    await waitFor(() => {
      expect(mockEventSourceInstance).not.toBeNull();
    });

    act(() => {
      mockEventSourceInstance?.onmessage?.(
        new MessageEvent("message", { data: JSON.stringify(shippingEvent) })
      );
    });

    await waitFor(() => {
      expect(logEvent).toHaveBeenCalledWith(
        "webhook_post",
        "POST",
        "/api/webhooks/ucp",
        "Shipping update: delivered"
      );
    });
  });
});
