"use client";

import type { TimeRange } from "@/types";

interface MetricsHeaderProps {
  timeRange: TimeRange;
  onTimeRangeChange: (timeRange: TimeRange) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  lastUpdated?: Date | null;
}

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "1h", label: "1H" },
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
];

/**
 * Dashboard header with title, time range selector, and refresh button
 */
export function MetricsHeader({
  timeRange,
  onTimeRangeChange,
  onRefresh,
  isLoading,
  lastUpdated,
}: MetricsHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 750,
            color: "rgba(255, 255, 255, 0.95)",
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          Retail Metrics Dashboard
        </h1>
        {lastUpdated && (
          <p
            style={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.5)",
              margin: "4px 0 0 0",
            }}
          >
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Time Range Tabs */}
        <div className="time-range-tabs">
          {TIME_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`time-range-tab ${timeRange === option.value ? "active" : ""}`}
              onClick={() => onTimeRangeChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          className={`refresh-btn ${isLoading ? "loading" : ""}`}
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refresh metrics"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
