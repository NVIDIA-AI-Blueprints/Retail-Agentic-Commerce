"use client";

import type { KPIData } from "@/types";
import { KPICard } from "../cards/KPICard";

interface KPIPanelProps {
  kpis: KPIData[];
  isLoading?: boolean;
}

/**
 * Row of KPI cards
 */
export function KPIPanel({ kpis, isLoading }: KPIPanelProps) {
  if (isLoading) {
    return (
      <div className="metrics-grid">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="kpi-card">
            <div className="glass-line w50" style={{ height: "12px", marginTop: 0 }} />
            <div className="glass-line w85" style={{ height: "32px", marginTop: "8px" }} />
            <div className="glass-line w50" style={{ height: "14px", marginTop: "8px" }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="metrics-grid">
      {kpis.map((kpi) => (
        <KPICard key={kpi.id} data={kpi} />
      ))}
    </div>
  );
}
