"use client";

import { Navbar, PanelDivider } from "@/components/layout";
import { AgentPanel } from "@/components/agent";
import { BusinessPanel } from "@/components/business";
import { AgentActivityPanel } from "@/components/agent-activity";
import { ACPLogProvider } from "@/hooks/useACPLog";
import { AgentActivityLogProvider } from "@/hooks/useAgentActivityLog";

/**
 * Main page - Three-panel layout with Agent simulator, Merchant view, and Agent Activity
 * Uses CSS custom properties for consistent spacing (see globals.css)
 * Wrapped in ACPLogProvider and AgentActivityLogProvider to share logs between panels
 */
export default function Home() {
  return (
    <ACPLogProvider>
      <AgentActivityLogProvider>
        <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
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
      </AgentActivityLogProvider>
    </ACPLogProvider>
  );
}
