"use client";

import { useMetrics } from "@/hooks/useMetrics";
import { MetricsHeader } from "./MetricsHeader";
import { KPIPanel } from "./panels/KPIPanel";
import { RevenuePanel } from "./panels/RevenuePanel";
import { AgentPerformancePanel } from "./panels/AgentPerformancePanel";
import { PromotionPanel } from "./panels/PromotionPanel";
import { ProductHealthPanel } from "./panels/ProductHealthPanel";

/**
 * Main dashboard container with Palantir-style grid layout
 */
export function MetricsDashboard() {
  const { state, setTimeRange, refresh } = useMetrics();
  const { timeRange, isLoading, lastUpdated, kpis, revenueData, agentPerformance, promotionBreakdown, productHealth } =
    state;

  return (
    <div className="dashboard-grid">
      {/* Header */}
      <MetricsHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onRefresh={refresh}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
      />

      {/* KPI Row */}
      <KPIPanel kpis={kpis} isLoading={isLoading} />

      {/* Revenue Chart */}
      <RevenuePanel data={revenueData} timeRange={timeRange} isLoading={isLoading} />

      {/* Two Column Row: Agent Performance & Promotions */}
      <div className="dashboard-row two-col">
        <AgentPerformancePanel data={agentPerformance} isLoading={isLoading} />
        <PromotionPanel data={promotionBreakdown} isLoading={isLoading} />
      </div>

      {/* Product Health Table */}
      <ProductHealthPanel data={productHealth} isLoading={isLoading} />
    </div>
  );
}
