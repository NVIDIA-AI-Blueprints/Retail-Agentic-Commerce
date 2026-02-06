"use client";

import type { AgentPerformanceData } from "@/types";

interface AgentPerformancePanelProps {
  data: AgentPerformanceData[];
  isLoading?: boolean;
}

/**
 * Agent performance bar chart panel
 */
export function AgentPerformancePanel({ data, isLoading }: AgentPerformancePanelProps) {
  if (isLoading) {
    return (
      <div className="chart-container">
        <div className="chart-title">
          <div className="glass-line w50" style={{ height: "14px", marginTop: 0 }} />
        </div>
        <div
          style={{
            height: "280px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="glass-line w85" style={{ height: "200px", width: "100%" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Agent Performance</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Success Rate Chart */}
        <div>
          <p
            style={{
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.5)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            App Success Rate
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.map((agent) => {
              const hasSuccessRate = agent.successRate !== null;
              const successRate = agent.successRate ?? 0;
              const barWidth = hasSuccessRate
                ? `${Math.max(0, Math.min(successRate, 100))}%`
                : "100%";
              return (
                <div
                  key={agent.agentType}
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "rgba(255, 255, 255, 0.6)",
                      width: "90px",
                      flexShrink: 0,
                    }}
                  >
                    {agent.label.replace(" Agent", "")}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "12px",
                      background: "rgba(255, 255, 255, 0.06)",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: barWidth,
                        height: "100%",
                        background: hasSuccessRate
                          ? "linear-gradient(90deg, #76b900, #5a9200)"
                          : "linear-gradient(90deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.08))",
                        borderRadius: "6px",
                        transition: "width 800ms ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "rgba(255, 255, 255, 0.9)",
                      width: "48px",
                      textAlign: "right",
                    }}
                  >
                    {hasSuccessRate ? `${successRate.toFixed(1)}%` : "N/A"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latency Chart */}
        <div>
          <p
            style={{
              fontSize: "11px",
              color: "rgba(255, 255, 255, 0.5)",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Avg Latency
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.map((agent) => {
              const maxLatency = Math.max(...data.map((d) => d.avgLatency));
              const widthPercent = maxLatency > 0 ? (agent.avgLatency / maxLatency) * 100 : 0;
              return (
                <div
                  key={agent.agentType}
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "rgba(255, 255, 255, 0.6)",
                      width: "90px",
                      flexShrink: 0,
                    }}
                  >
                    {agent.label.replace(" Agent", "")}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "12px",
                      background: "rgba(255, 255, 255, 0.06)",
                      borderRadius: "6px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${widthPercent}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, #ffd36b, #e6b84d)`,
                        borderRadius: "6px",
                        transition: "width 800ms ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "rgba(255, 255, 255, 0.9)",
                      width: "48px",
                      textAlign: "right",
                    }}
                  >
                    {agent.avgLatency}ms
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div
        style={{
          marginTop: "20px",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
        }}
      >
        {data.map((agent) => (
          <div
            key={agent.agentType}
            style={{
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "10px",
                color: "rgba(255, 255, 255, 0.5)",
                marginBottom: "4px",
                textTransform: "uppercase",
              }}
            >
              {agent.label.replace(" Agent", "")}
            </p>
            <p
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "rgba(255, 255, 255, 0.9)",
              }}
            >
              {agent.totalCalls.toLocaleString()}
            </p>
            <p
              style={{
                fontSize: "10px",
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              calls ({agent.errors} errors)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
