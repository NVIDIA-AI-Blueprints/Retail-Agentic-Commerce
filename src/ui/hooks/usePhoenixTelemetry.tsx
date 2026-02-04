"use client";

import { useState, useCallback, useEffect } from "react";
import type { PhoenixTraceData, AgentPerformanceData, AgentType } from "@/types";

interface PhoenixProject {
  id: string;
  name: string;
  description?: string;
}

interface PhoenixSpan {
  context: {
    trace_id: string;
    span_id: string;
  };
  name: string;
  start_time: string;
  end_time: string;
  status_code: string;
  attributes?: Record<string, unknown>;
}

interface UsePhoenixTelemetryResult {
  isLoading: boolean;
  error: string | null;
  projects: PhoenixProject[];
  traces: PhoenixTraceData[];
  agentPerformance: AgentPerformanceData[];
  fetchProjects: () => Promise<void>;
  fetchTraces: (projectId: string, limit?: number) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch telemetry data from Phoenix via the proxy route
 */
export function usePhoenixTelemetry(): UsePhoenixTelemetryResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<PhoenixProject[]>([]);
  const [traces, setTraces] = useState<PhoenixTraceData[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformanceData[]>([]);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/proxy/phoenix/v1/projects");
      if (!response.ok) {
        throw new Error("Failed to fetch Phoenix projects");
      }
      const data = await response.json();
      setProjects(data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTraces = useCallback(async (projectId: string, limit = 100) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/proxy/phoenix/v1/projects/${projectId}/traces?limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Phoenix traces");
      }
      const data = await response.json();
      const spans: PhoenixSpan[] = data.data ?? [];

      // Transform spans to traces
      const transformedTraces: PhoenixTraceData[] = spans.map((span) => {
        const trace: PhoenixTraceData = {
          traceId: span.context.trace_id,
          spanId: span.context.span_id,
          name: span.name,
          startTime: span.start_time,
          endTime: span.end_time,
          duration: new Date(span.end_time).getTime() - new Date(span.start_time).getTime(),
          status: span.status_code === "OK" ? "ok" : "error",
        };
        if (span.attributes) {
          trace.attributes = span.attributes;
        }
        return trace;
      });

      setTraces(transformedTraces);

      // Calculate agent performance from traces
      const performance = calculateAgentPerformance(transformedTraces);
      setAgentPerformance(performance);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setTraces([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    const firstProject = projects[0];
    if (projects.length > 0 && firstProject) {
      await fetchTraces(firstProject.id);
    } else {
      await fetchProjects();
    }
  }, [projects, fetchProjects, fetchTraces]);

  // Auto-fetch on mount
  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  return {
    isLoading,
    error,
    projects,
    traces,
    agentPerformance,
    fetchProjects,
    fetchTraces,
    refresh,
  };
}

/**
 * Calculate agent performance metrics from traces
 */
function calculateAgentPerformance(traces: PhoenixTraceData[]): AgentPerformanceData[] {
  const agentTypes: AgentType[] = ["promotion", "recommendation", "post_purchase", "search"];

  return agentTypes.map((agentType) => {
    // Filter traces for this agent type
    const agentTraces = traces.filter((trace) => {
      const name = trace.name.toLowerCase();
      return name.includes(agentType) || name.includes(agentType.replace("_", "-"));
    });

    const totalCalls = agentTraces.length;
    const errors = agentTraces.filter((t) => t.status === "error").length;
    const successRate = totalCalls > 0 ? ((totalCalls - errors) / totalCalls) * 100 : 100;
    const avgLatency =
      totalCalls > 0 ? agentTraces.reduce((sum, t) => sum + t.duration, 0) / totalCalls : 0;

    const labelMap: Record<AgentType, string> = {
      promotion: "Promotion Agent",
      recommendation: "Recommendation Agent",
      post_purchase: "Post-Purchase Agent",
      search: "Search Agent",
    };

    return {
      agentType,
      label: labelMap[agentType],
      successRate: Math.round(successRate * 10) / 10,
      avgLatency: Math.round(avgLatency),
      totalCalls,
      errors,
    };
  });
}
