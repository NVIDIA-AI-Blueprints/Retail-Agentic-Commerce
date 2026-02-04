"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import type { TimeRange, MetricsState, MetricsAction } from "@/types";
import { useMockMetrics } from "./useMockMetrics";

const initialState: MetricsState = {
  timeRange: "24h",
  isLoading: false,
  lastUpdated: null,
  kpis: [],
  revenueData: [],
  agentPerformance: [],
  promotionBreakdown: [],
  productHealth: [],
};

function metricsReducer(state: MetricsState, action: MetricsAction): MetricsState {
  switch (action.type) {
    case "SET_TIME_RANGE":
      return {
        ...state,
        timeRange: action.timeRange,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.isLoading,
      };
    case "UPDATE_METRICS":
      return {
        ...state,
        ...action.metrics,
        lastUpdated: new Date(),
      };
    case "REFRESH":
      return {
        ...state,
        lastUpdated: new Date(),
      };
    default:
      return state;
  }
}

interface MetricsContextType {
  state: MetricsState;
  setTimeRange: (timeRange: TimeRange) => void;
  refresh: () => void;
}

const MetricsContext = createContext<MetricsContextType | null>(null);

/**
 * Provider component for metrics state management
 */
export function MetricsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(metricsReducer, initialState);

  // Get mock data based on current time range
  const mockData = useMockMetrics(state.timeRange);

  // Update metrics when time range changes or on mount
  useEffect(() => {
    dispatch({ type: "SET_LOADING", isLoading: true });

    // Simulate API delay for realistic feel
    const timer = setTimeout(() => {
      dispatch({
        type: "UPDATE_METRICS",
        metrics: {
          kpis: mockData.kpis,
          revenueData: mockData.revenueData,
          agentPerformance: mockData.agentPerformance,
          promotionBreakdown: mockData.promotionBreakdown,
          productHealth: mockData.productHealth,
          isLoading: false,
        },
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [
    state.timeRange,
    mockData.kpis,
    mockData.revenueData,
    mockData.agentPerformance,
    mockData.promotionBreakdown,
    mockData.productHealth,
  ]);

  const setTimeRange = useCallback((timeRange: TimeRange) => {
    dispatch({ type: "SET_TIME_RANGE", timeRange });
  }, []);

  const refresh = useCallback(() => {
    dispatch({ type: "SET_LOADING", isLoading: true });

    // Simulate refresh delay
    setTimeout(() => {
      dispatch({ type: "REFRESH" });
      dispatch({ type: "SET_LOADING", isLoading: false });
    }, 500);
  }, []);

  const contextValue = useMemo(
    () => ({
      state,
      setTimeRange,
      refresh,
    }),
    [state, setTimeRange, refresh]
  );

  return <MetricsContext.Provider value={contextValue}>{children}</MetricsContext.Provider>;
}

/**
 * Hook to access metrics context
 */
export function useMetrics() {
  const context = useContext(MetricsContext);
  if (!context) {
    throw new Error("useMetrics must be used within MetricsProvider");
  }
  return context;
}
