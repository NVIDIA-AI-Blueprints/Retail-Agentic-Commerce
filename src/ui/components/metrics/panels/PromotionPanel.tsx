"use client";

import type { PromotionBreakdownData } from "@/types";
import { GlassPieChart } from "../charts/GlassPieChart";

interface PromotionPanelProps {
  data: PromotionBreakdownData[];
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
 * Promotion breakdown donut chart panel
 */
export function PromotionPanel({ data, isLoading }: PromotionPanelProps) {
  if (isLoading) {
    return (
      <div className="chart-container">
        <div className="chart-title">
          <div className="glass-line w50" style={{ height: "14px", marginTop: 0 }} />
        </div>
        <div
          style={{
            height: "240px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          />
        </div>
      </div>
    );
  }

  const pieData = data.map((item) => ({
    label: item.label,
    value: item.count,
    color: item.color,
  }));

  const promotionSpend = data.reduce((sum, item) => sum + item.totalSavings, 0);
  const discountedLineItems = data
    .filter((d) => d.type !== "NO_PROMO")
    .reduce((sum, d) => sum + d.count, 0);
  const totalLineItems = data.reduce((sum, item) => sum + item.count, 0);
  const discountCoverage =
    totalLineItems > 0 ? Math.round((discountedLineItems / totalLineItems) * 100) : 0;

  return (
    <div className="chart-container">
      <h3 className="chart-title">Promotion Impact</h3>
      <GlassPieChart
        data={pieData}
        formatValue={(v) => `${v} line items`}
        innerRadius={50}
        outerRadius={85}
      />
      <div
        style={{
          marginTop: "16px",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "10px",
              color: "rgba(255, 255, 255, 0.5)",
              textTransform: "uppercase",
            }}
          >
            Discounted Items
          </p>
          <p style={{ fontSize: "20px", fontWeight: 700, color: "#76b900" }}>
            {discountedLineItems.toLocaleString()}
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "10px",
              color: "rgba(255, 255, 255, 0.5)",
              textTransform: "uppercase",
            }}
          >
            Discount Coverage
          </p>
          <p style={{ fontSize: "20px", fontWeight: 700, color: "#76b900" }}>{discountCoverage}%</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "10px",
              color: "rgba(255, 255, 255, 0.5)",
              textTransform: "uppercase",
            }}
          >
            Promotion Spend
          </p>
          <p style={{ fontSize: "20px", fontWeight: 700, color: "#76b900" }}>
            {formatCurrency(promotionSpend)}
          </p>
        </div>
      </div>
      <p
        style={{
          marginTop: "12px",
          fontSize: "11px",
          color: "rgba(255, 255, 255, 0.55)",
          textAlign: "center",
        }}
      >
        Promotion spend is the discount amount granted to buyers.
      </p>
    </div>
  );
}
