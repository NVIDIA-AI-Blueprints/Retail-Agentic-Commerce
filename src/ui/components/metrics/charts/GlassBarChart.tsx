"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";

interface GlassBarChartProps<T> {
  data: T[];
  dataKey: keyof T;
  xAxisKey: keyof T;
  title?: string;
  formatValue?: (value: number, dataKey?: string) => string;
  colors?: string[];
  layout?: "vertical" | "horizontal";
  barSize?: number;
}

const DEFAULT_COLORS = ["#76b900", "#5a9200", "#3d6200", "#ffd36b"];

/**
 * Glass-styled bar chart wrapper for Recharts
 */
export function GlassBarChart<T extends Record<string, unknown>>({
  data,
  dataKey,
  xAxisKey,
  title,
  formatValue = (v) => String(v),
  colors = DEFAULT_COLORS,
  layout = "horizontal",
  barSize = 32,
}: GlassBarChartProps<T>) {
  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 10, right: 10, left: layout === "vertical" ? 100 : 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255, 255, 255, 0.06)"
            horizontal={layout === "horizontal"}
            vertical={layout === "vertical"}
          />
          {layout === "horizontal" ? (
            <>
              <XAxis
                dataKey={xAxisKey as string}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 11 }}
                dy={10}
              />
              <YAxis
                tickFormatter={(v) => formatValue(v)}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 11 }}
                dx={-10}
                width={50}
              />
            </>
          ) : (
            <>
              <XAxis
                type="number"
                tickFormatter={(v) => formatValue(v)}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey={xAxisKey as string}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "rgba(255, 255, 255, 0.6)", fontSize: 12 }}
                width={90}
              />
            </>
          )}
          <Tooltip content={<ChartTooltip formatValue={formatValue} />} />
          <Bar
            dataKey={dataKey as string}
            barSize={barSize}
            radius={[4, 4, 4, 4]}
            animationDuration={800}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]!} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
