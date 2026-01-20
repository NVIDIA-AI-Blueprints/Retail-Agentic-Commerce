import { Navbar } from "@/components/layout";
import { AgentPanel } from "@/components/agent";
import { BusinessPanel } from "@/components/business";

/**
 * Main page - Two-panel layout with Agent simulator and Merchant view
 */
export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-surface-base">
      <Navbar />
      <main className="flex-1 flex overflow-hidden">
        <AgentPanel />
        <BusinessPanel />
      </main>
    </div>
  );
}
