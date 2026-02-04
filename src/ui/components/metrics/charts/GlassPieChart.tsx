"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip } from "./ChartTooltip";

interface PieDataItem {
  label: string;
  value: number;
  color: string;
}

interface GlassPieChartProps {
  data: PieDataItem[];
  title?: string;
  formatValue?: (value: number) => string;
  innerRadius?: number;
  outerRadius?: number;
}

/**
 * Glass-styled donut/pie chart wrapper for Recharts
 */
export function GlassPieChart({
  data,
  title,
  formatValue = (v) => String(v),
  innerRadius = 60,
  outerRadius = 100,
}: GlassPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <ResponsiveContainer width="50%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              dataKey="value"
              nameKey="label"
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip formatValue={formatValue} />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {data.map((item, index) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "3px",
                      background: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
