import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
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

class MockEventSource {
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(url: string) {
    this.url = url;
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
    global.EventSource = MockEventSource as unknown as typeof EventSource;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("processes missed webhook events from polling", async () => {
    const shippingEvent = {
      id: "evt_1",
      type: "shipping_update",
      receivedAt: new Date().toISOString(),
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

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ events: [shippingEvent] }),
    });
    global.fetch = fetchMock;

    render(<WebhookToAgentActivityBridge />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(addPostPurchaseEvent).toHaveBeenCalled();
    });
  });
});
