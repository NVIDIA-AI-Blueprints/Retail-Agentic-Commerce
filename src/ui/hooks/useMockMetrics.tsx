"use client";

import { useMemo } from "react";
import type {
  TimeRange,
  KPIData,
  RevenueDataPoint,
  AgentPerformanceData,
  PromotionBreakdownData,
  ProductHealthData,
} from "@/types";

/**
 * Generate mock KPI data for demo purposes
 */
function generateKPIs(): KPIData[] {
  return [
    {
      id: "revenue",
      label: "Revenue",
      value: 12847500, // in cents = $128,475.00
      previousValue: 11234200,
      format: "currency",
      trend: "up",
      trendValue: 14.3,
    },
    {
      id: "orders",
      label: "Orders",
      value: 847,
      previousValue: 792,
      format: "number",
      trend: "up",
      trendValue: 6.9,
    },
    {
      id: "conversion",
      label: "Conv. Rate",
      value: 3.42,
      previousValue: 3.18,
      format: "percent",
      trend: "up",
      trendValue: 7.5,
    },
    {
      id: "aov",
      label: "Avg Order",
      value: 15170, // in cents = $151.70
      previousValue: 14186,
      format: "currency",
      trend: "up",
      trendValue: 6.9,
    },
    {
      id: "latency",
      label: "Agent Latency",
      value: 245, // in ms
      previousValue: 312,
      format: "duration",
      trend: "up",
      trendValue: -21.5,
    },
  ];
}

/**
 * Generate mock revenue data for the time range
 */
function generateRevenueData(timeRange: TimeRange): RevenueDataPoint[] {
  const now = new Date();
  const data: RevenueDataPoint[] = [];

  let points: number;
  let intervalMs: number;

  switch (timeRange) {
    case "1h":
      points = 12;
      intervalMs = 5 * 60 * 1000; // 5 minutes
      break;
    case "24h":
      points = 24;
      intervalMs = 60 * 60 * 1000; // 1 hour
      break;
    case "7d":
      points = 7;
      intervalMs = 24 * 60 * 60 * 1000; // 1 day
      break;
    case "30d":
      points = 30;
      intervalMs = 24 * 60 * 60 * 1000; // 1 day
      break;
    default:
      points = 24;
      intervalMs = 60 * 60 * 1000;
  }

  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMs);
    const baseRevenue = 3500 + Math.random() * 2500;
    const baseOrders = Math.floor(20 + Math.random() * 15);

    data.push({
      timestamp: timestamp.toISOString(),
      revenue: Math.round(baseRevenue * 100), // in cents
      orders: baseOrders,
    });
  }

  return data;
}

/**
 * Generate mock agent performance data
 */
function generateAgentPerformance(): AgentPerformanceData[] {
  return [
    {
      agentType: "promotion",
      label: "Promotion Agent",
      successRate: 94.2,
      avgLatency: 187,
      totalCalls: 1247,
      errors: 73,
    },
    {
      agentType: "recommendation",
      label: "Recommendation Agent",
      successRate: 98.7,
      avgLatency: 312,
      totalCalls: 892,
      errors: 12,
    },
    {
      agentType: "post_purchase",
      label: "Post-Purchase Agent",
      successRate: 99.1,
      avgLatency: 156,
      totalCalls: 634,
      errors: 6,
    },
    {
      agentType: "search",
      label: "Search Agent",
      successRate: 97.8,
      avgLatency: 89,
      totalCalls: 2156,
      errors: 47,
    },
  ];
}

/**
 * Generate mock promotion breakdown data
 */
function generatePromotionBreakdown(): PromotionBreakdownData[] {
  return [
    {
      type: "DISCOUNT_10_PCT",
      label: "10% Discount",
      count: 312,
      totalSavings: 4687500, // in cents
      color: "#76b900",
    },
    {
      type: "DISCOUNT_15_PCT",
      label: "15% Discount",
      count: 187,
      totalSavings: 5812300,
      color: "#5a9200",
    },
    {
      type: "DISCOUNT_20_PCT",
      label: "20% Discount",
      count: 94,
      totalSavings: 3921800,
      color: "#3d6200",
    },
    {
      type: "NO_PROMO",
      label: "No Promotion",
      count: 254,
      totalSavings: 0,
      color: "rgba(255, 255, 255, 0.2)",
    },
  ];
}

/**
 * Generate mock product health data
 */
function generateProductHealth(): ProductHealthData[] {
  return [
    {
      id: "1",
      name: "Premium Leather Running Shoes",
      sku: "SHO-RUN-001",
      stockLevel: 12,
      stockStatus: "low",
      basePrice: 12999, // $129.99
      competitorPrice: 13499,
      pricePosition: "below",
      lifecycle: "growth",
      demandVelocity: "accelerating",
      needsAttention: true,
      attentionReason: "Low stock",
    },
    {
      id: "2",
      name: "Classic Denim Jacket",
      sku: "JKT-DNM-042",
      stockLevel: 45,
      stockStatus: "healthy",
      basePrice: 8999,
      competitorPrice: 8999,
      pricePosition: "at",
      lifecycle: "mature",
      demandVelocity: "flat",
      needsAttention: false,
    },
    {
      id: "3",
      name: "Vintage Logo T-Shirt",
      sku: "TSH-VNT-108",
      stockLevel: 78,
      stockStatus: "healthy",
      basePrice: 3499,
      competitorPrice: 2999,
      pricePosition: "above",
      lifecycle: "clearance",
      demandVelocity: "decelerating",
      needsAttention: true,
      attentionReason: "Above market price",
    },
    {
      id: "4",
      name: "Waterproof Hiking Boots",
      sku: "SHO-HIK-023",
      stockLevel: 3,
      stockStatus: "critical",
      basePrice: 18999,
      competitorPrice: 18999,
      pricePosition: "at",
      lifecycle: "mature",
      demandVelocity: "decelerating",
      needsAttention: true,
      attentionReason: "Critical stock",
    },
    {
      id: "5",
      name: "Lightweight Windbreaker Jacket",
      sku: "JKT-WND-067",
      stockLevel: 156,
      stockStatus: "healthy",
      basePrice: 5999,
      competitorPrice: 6499,
      pricePosition: "below",
      lifecycle: "new_arrival",
      demandVelocity: "accelerating",
      needsAttention: false,
    },
  ];
}

/**
 * Hook to generate mock metrics data for demo purposes
 */
export function useMockMetrics(timeRange: TimeRange) {
  const kpis = useMemo(() => generateKPIs(), []);
  const revenueData = useMemo(() => generateRevenueData(timeRange), [timeRange]);
  const agentPerformance = useMemo(() => generateAgentPerformance(), []);
  const promotionBreakdown = useMemo(() => generatePromotionBreakdown(), []);
  const productHealth = useMemo(() => generateProductHealth(), []);

  return {
    kpis,
    revenueData,
    agentPerformance,
    promotionBreakdown,
    productHealth,
  };
}
