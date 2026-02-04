"use client";

import type { RevenueDataPoint, TimeRange } from "@/types";
import { GlassAreaChart } from "../charts/GlassAreaChart";

interface RevenuePanelProps {
  data: RevenueDataPoint[];
  timeRange: TimeRange;
  isLoading?: boolean;
}

/**
 * Format currency value from cents to dollars
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value / 100);
}

/**
 * Format timestamp for X axis based on time range
 */
function formatTimestamp(timestamp: string, timeRange: TimeRange): string {
  const date = new Date(timestamp);

  switch (timeRange) {
    case "1h":
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    case "24h":
      return date.toLocaleTimeString("en-US", { hour: "numeric" });
    case "7d":
      return date.toLocaleDateString("en-US", { weekday: "short" });
    case "30d":
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    default:
      return date.toLocaleTimeString("en-US", { hour: "numeric" });
  }
}

/**
 * Revenue over time area chart panel
 */
export function RevenuePanel({ data, timeRange, isLoading }: RevenuePanelProps) {
  if (isLoading) {
    return (
      <div className="chart-container">
        <div className="chart-title">
          <div className="glass-line w50" style={{ height: "14px", marginTop: 0 }} />
        </div>
        <div
          style={{
            height: "280px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="glass-line w85" style={{ height: "200px", width: "100%" }} />
        </div>
      </div>
    );
  }

  // Cast data to Record<string, unknown>[] for GlassAreaChart compatibility
  const chartData = data as unknown as Record<string, unknown>[];

  return (
    <GlassAreaChart
      data={chartData}
      dataKey="revenue"
      xAxisKey="timestamp"
      title="Revenue Over Time"
      formatValue={formatCurrency}
      formatXAxis={(ts) => formatTimestamp(ts, timeRange)}
      color="#76b900"
      gradientId="revenueGradient"
    />
  );
}
