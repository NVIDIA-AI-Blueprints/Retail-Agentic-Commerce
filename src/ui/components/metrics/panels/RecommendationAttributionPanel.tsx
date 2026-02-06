"use client";

import type { RecommendationAttributionData } from "@/types";

interface RecommendationAttributionPanelProps {
  data: RecommendationAttributionData;
  isLoading?: boolean;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function RecommendationAttributionPanel({
  data,
  isLoading,
}: RecommendationAttributionPanelProps) {
  if (isLoading) {
    return (
      <div className="chart-container">
        <div className="chart-title">
          <div className="glass-line w50" style={{ height: "14px", marginTop: 0 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="glass-line w85" style={{ height: "18px", marginTop: 0 }} />
          ))}
        </div>
      </div>
    );
  }

  const stages = [
    { label: "Impressions", value: data.impressions },
    { label: "Clicks", value: data.clicks },
    { label: "Purchases", value: data.purchases },
  ];
  const maxStageValue = Math.max(...stages.map((stage) => stage.value), 1);

  return (
    <div className="chart-container">
      <h3 className="chart-title">Recommendation Attribution</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        <div style={{ textAlign: "center" }}>
          <p
            style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}
          >
            Rec CTR
          </p>
          <p style={{ fontSize: "20px", fontWeight: 700, color: "#76b900" }}>
            {data.clickThroughRate !== null ? `${data.clickThroughRate.toFixed(1)}%` : "N/A"}
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}
          >
            Rec Conversion
          </p>
          <p style={{ fontSize: "20px", fontWeight: 700, color: "#76b900" }}>
            {data.conversionRate !== null ? `${data.conversionRate.toFixed(1)}%` : "N/A"}
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}
          >
            Attributed Revenue
          </p>
          <p style={{ fontSize: "20px", fontWeight: 700, color: "#76b900" }}>
            {formatCurrency(data.attributedRevenue)}
          </p>
        </div>
      </div>

      <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {stages.map((stage) => (
          <div key={stage.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ width: "88px", fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
              {stage.label}
            </span>
            <div
              style={{
                flex: 1,
                height: "12px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(stage.value / maxStageValue) * 100}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #76b900, #5a9200)",
                  borderRadius: "6px",
                }}
              />
            </div>
            <span
              style={{
                width: "52px",
                textAlign: "right",
                fontSize: "12px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.9)",
              }}
            >
              {stage.value}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "18px",
          paddingTop: "14px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
          Top Converting Recommended Products
        </p>
        {data.topProducts.length === 0 ? (
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
            No attributed purchases in this window.
          </p>
        ) : (
          data.topProducts.slice(0, 3).map((product) => (
            <div
              key={product.productId}
              style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}
            >
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)" }}>
                {product.productName}
              </span>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                {product.purchases}/{product.clicks} ({product.conversionRate ?? 0}%)
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
