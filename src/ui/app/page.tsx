"use client";

import { Navbar, PanelDivider } from "@/components/layout";
import { AgentPanel } from "@/components/agent";
import { BusinessPanel } from "@/components/business";
import { AgentActivityPanel } from "@/components/agent-activity";
import { ACPLogProvider } from "@/hooks/useACPLog";
import { AgentActivityLogProvider } from "@/hooks/useAgentActivityLog";
import { Nebula } from "@/kui-foundations-react-external/nebula";

/**
 * Main page - Three-panel layout with Agent simulator, Merchant view, and Agent Activity
 * Uses CSS custom properties for consistent spacing (see globals.css)
 * Wrapped in ACPLogProvider and AgentActivityLogProvider to share logs between panels
 * Features NVIDIA-style Nebula animated background with gradient overlays
 */
export default function Home() {
  return (
    <ACPLogProvider>
      <AgentActivityLogProvider>
        <div className="min-h-screen bg-surface-base relative">
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
            <div className="flex-1 flex flex-col overflow-hidden" style={{ padding: "24px 40px" }}>
              <main
                className="flex-1 flex items-stretch overflow-hidden w-full h-full"
                style={{ gap: "32px" }}
              >
                {/* Agent Panel Container */}
                <div className="flex-1 flex min-w-0">
                  <AgentPanel />
                </div>

                <PanelDivider />

                {/* Merchant Panel Container */}
                <div className="flex-1 flex min-w-0">
                  <BusinessPanel />
                </div>

                {/* Agent Activity Panel Container - no divider, same visual group as Merchant */}
                <div className="flex-1 flex min-w-0">
                  <AgentActivityPanel />
                </div>
              </main>
            </div>
          </div>
        </div>
      </AgentActivityLogProvider>
    </ACPLogProvider>
  );
}
