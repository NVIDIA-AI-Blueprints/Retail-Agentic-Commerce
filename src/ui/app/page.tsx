import { Navbar, PanelDivider } from "@/components/layout";
import { AgentPanel } from "@/components/agent";
import { BusinessPanel } from "@/components/business";

/**
 * Main page - Two-panel layout with Agent simulator and Merchant view
 */
export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-surface-sunken">
      <Navbar />
      <main className="flex-1 flex gap-8 overflow-hidden p-10">
        <AgentPanel />
        <PanelDivider />
        <BusinessPanel />
      </main>
    </div>
  );
}
