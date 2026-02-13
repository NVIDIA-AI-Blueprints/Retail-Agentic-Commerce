import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BusinessPanel } from "./BusinessPanel";
import { ACPLogProvider } from "@/hooks/useACPLog";
import { AgentActivityLogProvider } from "@/hooks/useAgentActivityLog";
import type { CheckoutProtocol } from "@/types";

function renderWithProviders(protocol: CheckoutProtocol = "acp") {
  return render(
    <AgentActivityLogProvider>
      <ACPLogProvider>
        <BusinessPanel protocol={protocol} onProtocolChange={() => {}} />
      </ACPLogProvider>
    </AgentActivityLogProvider>
  );
}

describe("BusinessPanel", () => {
  it("renders the Merchant Server badge", () => {
    renderWithProviders();
    expect(screen.getByText("Merchant Server")).toBeInTheDocument();
  });

  it("renders with section aria-label", () => {
    renderWithProviders();
    expect(screen.getByRole("region", { name: "Merchant Panel" })).toBeInTheDocument();
  });

  it("renders empty state message when no checkout is active", () => {
    renderWithProviders();
    // Glassmorphic empty state with waiting message
    expect(screen.getByText("No active session")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Select a product from the Client Agent panel to start a checkout session using ACP."
      )
    ).toBeInTheDocument();
  });

  it("renders glass panel header with badge", () => {
    const { container } = renderWithProviders();
    // Check for glassmorphic styling classes
    const header = container.querySelector(".glass-panel-header");
    expect(header).toBeInTheDocument();
    const badge = container.querySelector(".glass-badge");
    expect(badge).toBeInTheDocument();
  });

  it("renders ACP and UCP protocol tabs", () => {
    renderWithProviders();
    expect(screen.getByRole("tab", { name: "ACP" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "UCP" })).toBeInTheDocument();
  });
});
