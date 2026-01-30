import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BusinessPanel } from "./BusinessPanel";
import { ACPLogProvider } from "@/hooks/useACPLog";
import { AgentActivityLogProvider } from "@/hooks/useAgentActivityLog";

// Wrapper component to provide required context
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <AgentActivityLogProvider>
      <ACPLogProvider>{ui}</ACPLogProvider>
    </AgentActivityLogProvider>
  );
}

describe("BusinessPanel", () => {
  it("renders the Merchant Server badge", () => {
    renderWithProviders(<BusinessPanel />);
    expect(screen.getByText("Merchant Server")).toBeInTheDocument();
  });

  it("renders with section aria-label", () => {
    renderWithProviders(<BusinessPanel />);
    expect(screen.getByRole("region", { name: "Merchant Panel" })).toBeInTheDocument();
  });

  it("renders empty state message when no checkout is active", () => {
    renderWithProviders(<BusinessPanel />);
    // Glassmorphic empty state with waiting message
    expect(screen.getByText("No active session")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Select a product from the Client Agent panel to start an ACP checkout session."
      )
    ).toBeInTheDocument();
  });

  it("renders glass panel header with badge", () => {
    const { container } = renderWithProviders(<BusinessPanel />);
    // Check for glassmorphic styling classes
    const header = container.querySelector(".glass-panel-header");
    expect(header).toBeInTheDocument();
    const badge = container.querySelector(".glass-badge");
    expect(badge).toBeInTheDocument();
  });
});
