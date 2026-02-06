"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  AgentType,
  TimeRange,
  MetricsState,
  MetricsAction,
  KPIData,
  AgentPerformanceData,
  MetricsDashboardAPIResponse,
  MetricsAPIAgentOutcome,
  MetricsAPIPromotionBreakdown,
  MetricsAPIProductHealth,
  MetricsAPIRecommendationAttribution,
} from "@/types";
import { getMetricsDashboard } from "@/lib/api-client";
import { fetchPhoenixAgentPerformance } from "./usePhoenixTelemetry";

const initialState: MetricsState = {
  timeRange: "24h",
  isLoading: false,
  lastUpdated: null,
  kpis: [],
  revenueData: [],
  agentPerformance: [],
  recommendationAttribution: {
    impressions: 0,
    clicks: 0,
    purchases: 0,
    clickThroughRate: null,
    conversionRate: null,
    attributedRevenue: 0,
    topProducts: [],
  },
  promotionBreakdown: [],
  productHealth: [],
};

const PROMOTION_COLORS: Record<string, string> = {
  DISCOUNT_5_PCT: "#9ed253",
  DISCOUNT_10_PCT: "#76b900",
  DISCOUNT_15_PCT: "#5a9200",
  DISCOUNT_20_PCT: "#3d6200",
  NO_PROMO: "rgba(255, 255, 255, 0.2)",
};

const AGENT_LABELS: Record<AgentType, string> = {
  promotion: "Promotion Agent",
  recommendation: "Recommendation Agent",
  post_purchase: "Post-Purchase Agent",
  search: "Search Agent",
};

const AGENT_TYPES: AgentType[] = ["promotion", "recommendation", "post_purchase", "search"];

function metricsReducer(state: MetricsState, action: MetricsAction): MetricsState {
  switch (action.type) {
    case "SET_TIME_RANGE":
      return {
        ...state,
        timeRange: action.timeRange,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.isLoading,
      };
    case "UPDATE_METRICS":
      return {
        ...state,
        ...action.metrics,
        lastUpdated: new Date(),
      };
    case "REFRESH":
      return {
        ...state,
        lastUpdated: new Date(),
      };
    default:
      return state;
  }
}

interface MetricsContextType {
  state: MetricsState;
  setTimeRange: (timeRange: TimeRange) => void;
  refresh: () => void;
}

const MetricsContext = createContext<MetricsContextType | null>(null);

function mapDashboardKpis(
  dashboard: MetricsDashboardAPIResponse,
  phoenixPerformance: AgentPerformanceData[]
): KPIData[] {
  const merchantKpis: KPIData[] = dashboard.kpis.map((kpi) => ({
    id: kpi.id,
    label: kpi.label,
    value: kpi.value,
    previousValue: kpi.previous_value,
    format: kpi.format,
    trend: kpi.trend,
    trendValue: kpi.trend_value,
  }));

  const totalCalls = phoenixPerformance.reduce((sum, agent) => sum + agent.totalCalls, 0);
  const weightedLatency =
    totalCalls > 0
      ? Math.round(
          phoenixPerformance.reduce((sum, agent) => sum + agent.avgLatency * agent.totalCalls, 0) /
            totalCalls
        )
      : 0;

  const latencyKpi: KPIData = {
    id: "latency",
    label: "Agent Latency",
    value: weightedLatency,
    format: "duration",
  };

  return [...merchantKpis, latencyKpi];
}

function mapPromotions(promotions: MetricsAPIPromotionBreakdown[]) {
  return promotions.map((item) => ({
    type: item.type,
    label: item.label,
    count: item.count,
    totalSavings: item.total_savings,
    color: PROMOTION_COLORS[item.type] ?? "rgba(255, 255, 255, 0.2)",
  }));
}

function mapProductHealth(products: MetricsAPIProductHealth[]) {
  return products.map((product) => {
    const mapped = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      stockLevel: product.stock_level,
      stockStatus: product.stock_status,
      basePrice: product.base_price,
      pricePosition: product.price_position,
      needsAttention: product.needs_attention,
    };
    return {
      ...mapped,
      ...(product.competitor_price !== undefined
        ? { competitorPrice: product.competitor_price }
        : {}),
      ...(product.attention_reason !== undefined
        ? { attentionReason: product.attention_reason }
        : {}),
    };
  });
}

function mapRecommendationAttribution(attribution: MetricsAPIRecommendationAttribution) {
  return {
    impressions: attribution.impressions,
    clicks: attribution.clicks,
    purchases: attribution.purchases,
    clickThroughRate: attribution.click_through_rate,
    conversionRate: attribution.conversion_rate,
    attributedRevenue: attribution.attributed_revenue,
    topProducts: attribution.top_products.map((product) => ({
      productId: product.product_id,
      productName: product.product_name,
      clicks: product.clicks,
      purchases: product.purchases,
      conversionRate: product.conversion_rate,
      attributedRevenue: product.attributed_revenue,
    })),
  };
}

function mapAgentPerformance(
  phoenixPerformance: AgentPerformanceData[],
  agentOutcomes: MetricsAPIAgentOutcome[]
): AgentPerformanceData[] {
  const byPhoenix = new Map(phoenixPerformance.map((entry) => [entry.agentType, entry]));
  const byOutcome = new Map(agentOutcomes.map((entry) => [entry.agent_type, entry]));

  return AGENT_TYPES.map((agentType) => {
    const phoenix = byPhoenix.get(agentType);
    const outcome = byOutcome.get(agentType);

    return {
      agentType,
      label: AGENT_LABELS[agentType],
      successRate: outcome?.success_rate ?? null,
      avgLatency: phoenix?.avgLatency ?? 0,
      totalCalls: outcome?.total_calls ?? phoenix?.totalCalls ?? 0,
      errors: outcome?.errors ?? 0,
    };
  });
}

/**
 * Provider component for metrics state management
 */
export function MetricsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(metricsReducer, initialState);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Update metrics when time range changes or refresh is requested.
  useEffect(() => {
    let isCancelled = false;

    const loadMetrics = async () => {
      dispatch({ type: "SET_LOADING", isLoading: true });
      try {
        const [dashboardResult, performanceResult] = await Promise.allSettled([
          getMetricsDashboard(state.timeRange),
          fetchPhoenixAgentPerformance(state.timeRange),
        ]);

        if (dashboardResult.status !== "fulfilled") {
          throw dashboardResult.reason;
        }

        const dashboard = dashboardResult.value;
        const phoenixPerformance =
          performanceResult.status === "fulfilled" ? performanceResult.value : [];
        const agentPerformance = mapAgentPerformance(
          phoenixPerformance,
          dashboard.agent_outcomes ?? []
        );

        if (isCancelled) {
          return;
        }

        dispatch({
          type: "UPDATE_METRICS",
          metrics: {
            kpis: mapDashboardKpis(dashboard, phoenixPerformance),
            revenueData: dashboard.revenue_data,
            agentPerformance,
            recommendationAttribution: mapRecommendationAttribution(
              dashboard.recommendation_attribution
            ),
            promotionBreakdown: mapPromotions(dashboard.promotion_breakdown),
            productHealth: mapProductHealth(dashboard.product_health),
            isLoading: false,
          },
        });
      } catch {
        if (!isCancelled) {
          dispatch({ type: "SET_LOADING", isLoading: false });
        }
      }
    };

    void loadMetrics();

    return () => {
      isCancelled = true;
    };
  }, [state.timeRange, refreshCounter]);

  const setTimeRange = useCallback((timeRange: TimeRange) => {
    dispatch({ type: "SET_TIME_RANGE", timeRange });
  }, []);

  const refresh = useCallback(() => {
    dispatch({ type: "REFRESH" });
    setRefreshCounter((current) => current + 1);
  }, []);

  const contextValue = useMemo(
    () => ({
      state,
      setTimeRange,
      refresh,
    }),
    [state, setTimeRange, refresh]
  );

  return <MetricsContext.Provider value={contextValue}>{children}</MetricsContext.Provider>;
}

/**
 * Hook to access metrics context
 */
export function useMetrics() {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error("useMetrics must be used within MetricsProvider");
  }
  return context;
}
