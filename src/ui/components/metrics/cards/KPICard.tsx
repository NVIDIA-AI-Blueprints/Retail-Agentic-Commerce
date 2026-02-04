"use client";

import type { KPIData } from "@/types";

/**
 * Format a value based on its format type
 */
function formatValue(value: number, format: KPIData["format"]): string {
  switch (format) {
    case "currency":
      // Value is in cents, convert to dollars
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value / 100);
    case "number":
      return new Intl.NumberFormat("en-US").format(value);
    case "percent":
      return `${value.toFixed(1)}%`;
    case "duration":
      return `${value}ms`;
    default:
      return String(value);
  }
}

/**
 * Trend arrow icon
 */
function TrendIcon({ trend }: { trend: "up" | "down" | "neutral" }) {
  if (trend === "neutral") {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    );
  }

  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: trend === "down" ? "rotate(180deg)" : undefined }}
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

interface KPICardProps {
  data: KPIData;
}

/**
 * Individual KPI card display with glass-morphic styling
 */
export function KPICard({ data }: KPICardProps) {
  const { label, value, format, trend, trendValue } = data;

  // For latency, a decrease is positive
  const isPositiveTrend = format === "duration" ? (trendValue ?? 0) < 0 : (trendValue ?? 0) > 0;

  const trendClass = trend
    ? isPositiveTrend
      ? "up"
      : trend === "neutral"
        ? "neutral"
        : "down"
    : "neutral";

  return (
    <div className="kpi-card">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{formatValue(value, format)}</span>
      {trend && trendValue !== undefined && (
        <span className={`kpi-trend ${trendClass}`}>
          <TrendIcon trend={isPositiveTrend ? "up" : "down"} />
          {Math.abs(trendValue).toFixed(1)}%
        </span>
      )}
    </div>
  );
}
