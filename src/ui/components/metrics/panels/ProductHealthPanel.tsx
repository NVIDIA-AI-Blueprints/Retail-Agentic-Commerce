"use client";

import type { ProductHealthData } from "@/types";

interface ProductHealthPanelProps {
  data: ProductHealthData[];
  isLoading?: boolean;
}

/**
 * Format currency value from cents to dollars
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

/**
 * Get stock status badge class
 */
function getStockStatusClass(status: ProductHealthData["stockStatus"]): string {
  switch (status) {
    case "healthy":
      return "stock-badge healthy";
    case "low":
      return "stock-badge low";
    case "critical":
      return "stock-badge critical";
    default:
      return "stock-badge";
  }
}

/**
 * Get lifecycle badge style
 */
function getLifecycleBadge(lifecycle: string) {
  const styles: Record<string, { color: string; label: string }> = {
    new_arrival: { color: "#7CD7FE", label: "New" },
    growth: { color: "#76b900", label: "Growth" },
    mature: { color: "rgba(255, 255, 255, 0.5)", label: "Mature" },
    clearance: { color: "#ef4444", label: "Clearance" },
  };
  const s = styles[lifecycle] ?? { color: "rgba(255, 255, 255, 0.4)", label: lifecycle };
  return (
    <span style={{ color: s.color, fontSize: "11px", fontWeight: 600 }}>{s.label}</span>
  );
}

/**
 * Get velocity indicator
 */
function VelocityIndicator({ velocity }: { velocity: string }) {
  switch (velocity) {
    case "accelerating":
      return (
        <span style={{ color: "#76b900", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          Accel
        </span>
      );
    case "decelerating":
      return (
        <span style={{ color: "#ef4444", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
          </svg>
          Decel
        </span>
      );
    default:
      return (
        <span style={{ color: "rgba(255, 255, 255, 0.5)", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Flat
        </span>
      );
  }
}

/**
 * Get price position indicator
 */
function PricePositionIndicator({ position }: { position: ProductHealthData["pricePosition"] }) {
  switch (position) {
    case "above":
      return (
        <span
          style={{ color: "#ef4444", display: "inline-flex", alignItems: "center", gap: "4px" }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
          Above
        </span>
      );
    case "below":
      return (
        <span
          style={{ color: "#76b900", display: "inline-flex", alignItems: "center", gap: "4px" }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          Below
        </span>
      );
    case "at":
      return (
        <span
          style={{
            color: "rgba(255, 255, 255, 0.6)",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
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
          At Market
        </span>
      );
    default:
      return <span style={{ color: "rgba(255, 255, 255, 0.4)" }}>Unknown</span>;
  }
}

/**
 * Product health table panel
 */
export function ProductHealthPanel({ data, isLoading }: ProductHealthPanelProps) {
  if (isLoading) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Product Health</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-line w85" style={{ height: "48px", marginTop: 0 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container" style={{ overflow: "auto" }}>
      <h3 className="chart-title">Product Health</h3>
      <table className="product-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Stock</th>
            <th>Our Price</th>
            <th>vs. Market</th>
            <th>Lifecycle</th>
            <th>Velocity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((product) => (
            <tr key={product.id}>
              <td style={{ fontWeight: 600, color: "rgba(255, 255, 255, 0.9)" }}>{product.name}</td>
              <td style={{ fontFamily: "monospace", fontSize: "11px" }}>{product.sku}</td>
              <td>
                <span className={getStockStatusClass(product.stockStatus)}>
                  {product.stockLevel} units
                </span>
              </td>
              <td style={{ fontWeight: 600 }}>{formatCurrency(product.basePrice)}</td>
              <td>
                <PricePositionIndicator position={product.pricePosition} />
              </td>
              <td>{getLifecycleBadge(product.lifecycle)}</td>
              <td><VelocityIndicator velocity={product.demandVelocity} /></td>
              <td>
                {product.needsAttention ? (
                  <span className="attention-flag">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {product.attentionReason}
                  </span>
                ) : (
                  <span style={{ color: "#76b900", fontSize: "12px", fontWeight: 600 }}>
                    Healthy
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
