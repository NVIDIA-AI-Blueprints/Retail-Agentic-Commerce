"use client";

import { Navbar } from "@/components/layout";
import { MetricsDashboard } from "@/components/metrics";
import { MetricsProvider } from "@/hooks/useMetrics";
import { Nebula } from "@/kui-foundations-react-external/nebula";

/**
 * Metrics Dashboard page - analytics for retail operations
 * Features NVIDIA-style Nebula animated background with gradient overlays
 */
export default function MetricsPage() {
  return (
    <MetricsProvider>
      <div className="min-h-screen bg-surface-base relative overflow-auto">
        {/* Nebula Background */}
        <div
          className="pointer-events-none"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 0,
            overflow: "hidden",
          }}
        >
          <div style={{ width: "100%", height: "100%" }}>
            <Nebula variant="ambient" />
          </div>
        </div>

        {/* Top Green Gradient Overlay */}
        <div
          className="pointer-events-none"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "500px",
            background: "linear-gradient(80.22deg, #BFF230 1.49%, #7CD7FE 99.95%)",
            opacity: 0.12,
            zIndex: 0,
            maskImage:
              "radial-gradient(ellipse 150% 120% at top, black 0%, black 30%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 150% 120% at top, black 0%, black 30%, transparent 70%)",
          }}
        />

        {/* Bottom Green Gradient Overlay */}
        <div
          className="pointer-events-none"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: "300px",
            background: "linear-gradient(80.22deg, #BFF230 1.49%, #7CD7FE 99.95%)",
            opacity: 0.12,
            zIndex: 0,
            maskImage:
              "radial-gradient(ellipse 120% 130% at bottom, black 0%, black 25%, transparent 60%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 120% 130% at bottom, black 0%, black 25%, transparent 60%)",
          }}
        />

        {/* Content Layer */}
        <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>
          <Navbar />
          {/* Outer container with generous gutters for premium feel */}
          <div className="flex-1 flex flex-col" style={{ padding: "24px 40px 40px" }}>
            <main className="glass-panel flex-1" style={{ padding: "24px" }}>
              <MetricsDashboard />
            </main>
          </div>
        </div>
      </div>
    </MetricsProvider>
  );
}
