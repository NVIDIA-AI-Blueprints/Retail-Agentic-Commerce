"use client";

import { useState, useCallback, useEffect } from "react";
import type { PhoenixTraceData, AgentPerformanceData, AgentType, TimeRange } from "@/types";

interface PhoenixProject {
  id: string;
  name: string;
  description?: string;
}

interface PhoenixSpan {
  id?: string;
  context: {
    trace_id: string;
    span_id: string;
  };
  name: string;
  parent_id?: string | null;
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
  fetchTraces: (
    projectId: string,
    limit?: number,
    startTime?: string,
    endTime?: string
  ) => Promise<void>;
  refresh: () => Promise<void>;
}

const AGENT_PROJECTS: Record<AgentType, string> = {
  promotion: "promotion-agent",
  recommendation: "arag-recommendations",
  post_purchase: "post-purchase-agent",
  search: "search-agent",
};

const AGENT_LABELS: Record<AgentType, string> = {
  promotion: "Promotion Agent",
  recommendation: "Recommendation Agent",
  post_purchase: "Post-Purchase Agent",
  search: "Search Agent",
};

function getWindowStart(timeRange: TimeRange): string {
  const now = new Date();
  let ms = 24 * 60 * 60 * 1000;
  if (timeRange === "1h") {
    ms = 60 * 60 * 1000;
  } else if (timeRange === "7d") {
    ms = 7 * 24 * 60 * 60 * 1000;
  } else if (timeRange === "30d") {
    ms = 30 * 24 * 60 * 60 * 1000;
  }
  return new Date(now.getTime() - ms).toISOString();
}

async function fetchProjectSpans(
  projectId: string,
  startTime: string,
  endTime: string,
  limit = 1000
): Promise<PhoenixSpan[]> {
  let cursor: string | null = null;
  const spans: PhoenixSpan[] = [];

  do {
    const params = new URLSearchParams({
      limit: String(limit),
      start_time: startTime,
      end_time: endTime,
    });
    if (cursor) {
      params.set("cursor", cursor);
    }
    const response = await fetch(`/api/proxy/phoenix/v1/projects/${projectId}/spans?${params}`);
    if (!response.ok) {
      throw new Error("Failed to fetch Phoenix spans");
    }
    const payload = await response.json();
    spans.push(...((payload.data as PhoenixSpan[]) ?? []));
    cursor = (payload.next_cursor as string | null) ?? null;
  } while (cursor);

  return spans;
}

function topLevelSpans(spans: PhoenixSpan[]): PhoenixSpan[] {
  return spans.filter((span) => span.parent_id == null);
}

function summarizeSpans(agentType: AgentType, spans: PhoenixSpan[]): AgentPerformanceData {
  const totalCalls = spans.length;
  const avgLatency =
    totalCalls > 0
      ? Math.round(
          spans.reduce((sum, span) => {
            const duration =
              new Date(span.end_time).getTime() - new Date(span.start_time).getTime();
            return sum + Math.max(duration, 0);
          }, 0) / totalCalls
        )
      : 0;

  return {
    agentType,
    label: AGENT_LABELS[agentType],
    successRate: null,
    avgLatency,
    totalCalls,
    errors: 0,
  };
}

/**
 * Fetch per-agent performance metrics from Phoenix for a given time range.
 */
export async function fetchPhoenixAgentPerformance(
  timeRange: TimeRange
): Promise<AgentPerformanceData[]> {
  const startTime = getWindowStart(timeRange);
  const endTime = new Date().toISOString();
  const projectsResponse = await fetch("/api/proxy/phoenix/v1/projects");

  if (!projectsResponse.ok) {
    throw new Error("Failed to fetch Phoenix projects");
  }

  const projectsPayload = await projectsResponse.json();
  const projects: PhoenixProject[] = projectsPayload.data ?? [];
  const projectByName = new Map(projects.map((project) => [project.name, project.id]));

  const agentTypes: AgentType[] = ["promotion", "recommendation", "post_purchase", "search"];
  const results = await Promise.all(
    agentTypes.map(async (agentType) => {
      const projectName = AGENT_PROJECTS[agentType];
      const projectId = projectByName.get(projectName);
      if (!projectId) {
        return summarizeSpans(agentType, []);
      }

      const spans = await fetchProjectSpans(projectId, startTime, endTime);
      return summarizeSpans(agentType, topLevelSpans(spans));
    })
  );

  return results;
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

  const fetchTraces = useCallback(
    async (projectId: string, limit = 100, startTime?: string, endTime?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ limit: String(limit) });
        if (startTime) {
          params.set("start_time", startTime);
        }
        if (endTime) {
          params.set("end_time", endTime);
        }
        const response = await fetch(`/api/proxy/phoenix/v1/projects/${projectId}/spans?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch Phoenix spans");
        }
        const data = await response.json();
        const spans: PhoenixSpan[] = data.data ?? [];

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
        const performance = calculateAgentPerformance(transformedTraces);
        setAgentPerformance(performance);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setTraces([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const performance = await fetchPhoenixAgentPerformance("24h");
      setAgentPerformance(performance);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setAgentPerformance([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    void fetchProjects();
    void refresh();
  }, [fetchProjects, refresh]);

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
 * Calculate agent performance metrics from traces.
 *
 * Note: This fallback parser infers agent type from span names and is mainly
 * for manual debugging. Dashboard aggregation uses project-based mapping.
 */
function calculateAgentPerformance(traces: PhoenixTraceData[]): AgentPerformanceData[] {
  const agentTypes: AgentType[] = ["promotion", "recommendation", "post_purchase", "search"];

  return agentTypes.map((agentType) => {
    const agentTraces = traces.filter((trace) => {
      const name = trace.name.toLowerCase();
      return name.includes(agentType) || name.includes(agentType.replace("_", "-"));
    });

    const totalCalls = agentTraces.length;
    const avgLatency =
      totalCalls > 0 ? agentTraces.reduce((sum, trace) => sum + trace.duration, 0) / totalCalls : 0;

    return {
      agentType,
      label: AGENT_LABELS[agentType],
      successRate: null,
      avgLatency: Math.round(avgLatency),
      totalCalls,
      errors: 0,
    };
  });
}
