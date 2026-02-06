import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MetricsProvider, useMetrics } from "./useMetrics";
import { getMetricsDashboard } from "@/lib/api-client";
import { fetchPhoenixAgentPerformance } from "./usePhoenixTelemetry";
import type { MetricsDashboardAPIResponse, AgentPerformanceData } from "@/types";

vi.mock("@/lib/api-client", () => ({
  getMetricsDashboard: vi.fn(),
}));

vi.mock("./usePhoenixTelemetry", () => ({
  fetchPhoenixAgentPerformance: vi.fn(),
}));

const mockDashboardResponse: MetricsDashboardAPIResponse = {
  effective_window: {
    requested_time_range: "24h",
    start: "2026-02-05T00:00:00.000Z",
    end: "2026-02-06T00:00:00.000Z",
    fallback_applied: false,
  },
  kpis: [
    {
      id: "revenue",
      label: "Revenue",
      value: 100000,
      previous_value: 90000,
      format: "currency",
      trend: "up",
      trend_value: 11.1,
    },
    {
      id: "orders",
      label: "Orders",
      value: 20,
      previous_value: 10,
      format: "number",
      trend: "up",
      trend_value: 100,
    },
    {
      id: "conversion",
      label: "Conv. Rate",
      value: 50,
      previous_value: 40,
      format: "percent",
      trend: "up",
      trend_value: 25,
    },
    {
      id: "aov",
      label: "Avg Order",
      value: 5000,
      previous_value: 4500,
      format: "currency",
      trend: "up",
      trend_value: 11.1,
    },
  ],
  revenue_data: [{ timestamp: "2026-02-05T12:00:00.000Z", revenue: 100000, orders: 20 }],
  agent_outcomes: [
    {
      agent_type: "promotion",
      total_calls: 8,
      errors: 2,
      success_rate: 75,
      source: "application",
    },
    {
      agent_type: "recommendation",
      total_calls: 0,
      errors: 0,
      success_rate: null,
      source: "unavailable",
    },
    {
      agent_type: "post_purchase",
      total_calls: 0,
      errors: 0,
      success_rate: null,
      source: "unavailable",
    },
    {
      agent_type: "search",
      total_calls: 0,
      errors: 0,
      success_rate: null,
      source: "unavailable",
    },
  ],
  recommendation_attribution: {
    impressions: 40,
    clicks: 10,
    purchases: 3,
    click_through_rate: 25,
    conversion_rate: 30,
    attributed_revenue: 7500,
    top_products: [
      {
        product_id: "prod_2",
        product_name: "V-Neck Tee",
        clicks: 5,
        purchases: 2,
        conversion_rate: 40,
        attributed_revenue: 5600,
      },
    ],
  },
  promotion_breakdown: [
    { type: "DISCOUNT_10_PCT", label: "10% Discount", count: 12, total_savings: 1300 },
  ],
  product_health: [
    {
      id: "prod_1",
      name: "Classic Tee",
      sku: "TS-001",
      stock_level: 5,
      stock_status: "critical",
      base_price: 2500,
      competitor_price: 2300,
      price_position: "above",
      needs_attention: true,
      attention_reason: "Critical stock",
    },
  ],
};

const mockAgentPerformance: AgentPerformanceData[] = [
  {
    agentType: "promotion",
    label: "Promotion Agent",
    successRate: null,
    avgLatency: 200,
    totalCalls: 10,
    errors: 0,
  },
  {
    agentType: "recommendation",
    label: "Recommendation Agent",
    successRate: null,
    avgLatency: 100,
    totalCalls: 5,
    errors: 0,
  },
  {
    agentType: "post_purchase",
    label: "Post-Purchase Agent",
    successRate: null,
    avgLatency: 50,
    totalCalls: 0,
    errors: 0,
  },
  {
    agentType: "search",
    label: "Search Agent",
    successRate: null,
    avgLatency: 80,
    totalCalls: 0,
    errors: 0,
  },
];

const wrapper = ({ children }: { children: ReactNode }) => (
  <MetricsProvider>{children}</MetricsProvider>
);

describe("useMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getMetricsDashboard).mockResolvedValue(mockDashboardResponse);
    vi.mocked(fetchPhoenixAgentPerformance).mockResolvedValue(mockAgentPerformance);
  });

  it("throws when used outside MetricsProvider", () => {
    const originalError = console.error;
    console.error = () => {};

    expect(() => renderHook(() => useMetrics())).toThrow(
      "useMetrics must be used within MetricsProvider"
    );

    console.error = originalError;
  });

  it("loads and maps real dashboard data on mount", async () => {
    const { result } = renderHook(() => useMetrics(), { wrapper });

    await waitFor(() => {
      expect(result.current.state.kpis).toHaveLength(5);
    });

    expect(getMetricsDashboard).toHaveBeenCalledWith("24h");
    expect(fetchPhoenixAgentPerformance).toHaveBeenCalledWith("24h");
    expect(result.current.state.revenueData).toEqual(mockDashboardResponse.revenue_data);
    expect(result.current.state.agentPerformance).toEqual([
      {
        agentType: "promotion",
        label: "Promotion Agent",
        successRate: 75,
        avgLatency: 200,
        totalCalls: 8,
        errors: 2,
      },
      {
        agentType: "recommendation",
        label: "Recommendation Agent",
        successRate: null,
        avgLatency: 100,
        totalCalls: 0,
        errors: 0,
      },
      {
        agentType: "post_purchase",
        label: "Post-Purchase Agent",
        successRate: null,
        avgLatency: 50,
        totalCalls: 0,
        errors: 0,
      },
      {
        agentType: "search",
        label: "Search Agent",
        successRate: null,
        avgLatency: 80,
        totalCalls: 0,
        errors: 0,
      },
    ]);
    expect(result.current.state.productHealth[0]?.stockStatus).toBe("critical");
    expect(result.current.state.promotionBreakdown[0]?.totalSavings).toBe(1300);
    expect(result.current.state.recommendationAttribution.purchases).toBe(3);
    expect(result.current.state.recommendationAttribution.topProducts[0]?.productId).toBe("prod_2");

    const latencyKpi = result.current.state.kpis.find((kpi) => kpi.id === "latency");
    expect(latencyKpi?.value).toBe(167);
  });

  it("refetches when time range changes", async () => {
    const { result } = renderHook(() => useMetrics(), { wrapper });

    await waitFor(() => {
      expect(getMetricsDashboard).toHaveBeenCalledWith("24h");
    });

    act(() => {
      result.current.setTimeRange("7d");
    });

    await waitFor(() => {
      expect(getMetricsDashboard).toHaveBeenLastCalledWith("7d");
    });
  });

  it("refresh triggers another fetch cycle", async () => {
    const { result } = renderHook(() => useMetrics(), { wrapper });

    await waitFor(() => {
      expect(getMetricsDashboard).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(getMetricsDashboard).toHaveBeenCalledTimes(2);
    });
  });
});
