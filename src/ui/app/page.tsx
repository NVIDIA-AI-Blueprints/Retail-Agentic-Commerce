"use client";

import { Navbar, PanelDivider } from "@/components/layout";
import { AgentPanel } from "@/components/agent";
import { BusinessPanel } from "@/components/business";
import { ACPLogProvider } from "@/hooks/useACPLog";

/**
 * Main page - Two-panel layout with Agent simulator and Merchant view
 * Uses CSS custom properties for consistent spacing (see globals.css)
 * Wrapped in ACPLogProvider to share communication logs between panels
 */
export default function Home() {
  return (
    <ACPLogProvider>
      <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
        <Navbar />
        {/* Outer container with generous gutters for premium feel */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ padding: "24px 40px" }}>
          <main
            className="flex-1 flex items-stretch overflow-hidden w-full h-full mx-auto"
            style={{ gap: "32px", maxWidth: "1440px" }}
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
          </main>
        </div>
      </div>
    </ACPLogProvider>
  );
}
