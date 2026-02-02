import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { MerchantIframeContainer } from "./MerchantIframeContainer";

const mockGetWidgetUrl = vi.fn();
const mockCallToolWithWidget = vi.fn();

vi.mock("@/hooks/useMCPClient", () => ({
  useMCPClient: () => ({
    getWidgetUrl: mockGetWidgetUrl,
    callTool: vi.fn(),
    callToolWithWidget: mockCallToolWithWidget,
  }),
}));

vi.mock("@/hooks/useACPLog", () => ({
  useACPLog: () => ({
    logEvent: vi.fn(),
    completeEvent: vi.fn(),
  }),
}));

vi.mock("@/hooks/useAgentActivityLog", () => ({
  useAgentActivityLog: () => ({
    logAgentCall: vi.fn(() => "agent-event"),
    completeAgentCall: vi.fn(),
  }),
}));

describe("MerchantIframeContainer", () => {
  beforeEach(() => {
    mockGetWidgetUrl.mockResolvedValue({
      widgetUrl: "http://example.com/widget",
      widgetUri: "ui://widget/merchant-app.html",
      result: { products: [] },
      error: null,
    });
    mockCallToolWithWidget.mockReset();
  });

  it("hides the iframe while search loading is active", async () => {
    vi.useFakeTimers();

    const { rerender, container } = render(
      <MerchantIframeContainer searchRequest={{ query: "initial", requestId: 1 }} />
    );

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    const iframe = container.querySelector("iframe");
    expect(iframe).toBeTruthy();

    await act(async () => {
      iframe?.dispatchEvent(new Event("load"));
    });

    const pendingSearch = new Promise(() => {});
    mockCallToolWithWidget.mockReturnValue(pendingSearch);

    rerender(<MerchantIframeContainer searchRequest={{ query: "dresses", requestId: 2 }} />);

    const updatedIframe = container.querySelector("iframe");
    expect(updatedIframe).toHaveStyle({ opacity: "0" });
    expect(container.firstChild).toHaveClass("is-search-loading");

    vi.useRealTimers();
  });
});
