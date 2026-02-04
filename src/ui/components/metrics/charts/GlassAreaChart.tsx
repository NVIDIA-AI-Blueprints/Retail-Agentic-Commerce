"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";

interface GlassAreaChartProps {
  data: Record<string, unknown>[];
  dataKey: string;
  xAxisKey: string;
  title?: string;
  formatValue?: (value: number) => string;
  formatXAxis?: (value: string) => string;
  color?: string;
  gradientId?: string;
}

/**
 * Glass-styled area chart wrapper for Recharts
 */
export function GlassAreaChart({
  data,
  dataKey,
  xAxisKey,
  title,
  formatValue = (v) => String(v),
  formatXAxis = (v) => v,
  color = "#76b900",
  gradientId = "areaGradient",
}: GlassAreaChartProps) {
  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255, 255, 255, 0.06)"
            vertical={false}
          />
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={formatXAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 11 }}
            dy={10}
          />
          <YAxis
            tickFormatter={formatValue}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 11 }}
            dx={-10}
            width={60}
          />
          <Tooltip content={<ChartTooltip formatValue={(v) => formatValue(v)} />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
            animationDuration={800}
            name="Revenue"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
