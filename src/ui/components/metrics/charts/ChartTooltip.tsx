"use client";

interface TooltipPayload {
  name: string;
  value: number;
  color?: string;
  dataKey?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  formatValue?: (value: number, dataKey?: string) => string;
  labelFormatter?: (label: string) => string;
}

/**
 * Custom tooltip component for Recharts with glass-morphic styling
 */
export function ChartTooltip({
  active,
  payload,
  label,
  formatValue = (v) => String(v),
  labelFormatter = (l) => l,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: "linear-gradient(180deg, rgba(12, 12, 12, 0.95), rgba(12, 12, 12, 0.9))",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: "12px",
        padding: "12px 14px",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      }}
    >
      {label && (
        <p
          style={{
            margin: "0 0 8px 0",
            fontSize: "11px",
            fontWeight: 600,
            color: "rgba(255, 255, 255, 0.6)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {labelFormatter(label)}
        </p>
      )}
      {payload.map((entry, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: index > 0 ? "6px" : 0,
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: entry.color ?? "#76b900",
            }}
          />
          <span
            style={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            {entry.name}:
          </span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "rgba(255, 255, 255, 0.95)",
            }}
          >
            {formatValue(entry.value, entry.dataKey)}
          </span>
        </div>
      ))}
    </div>
  );
}
