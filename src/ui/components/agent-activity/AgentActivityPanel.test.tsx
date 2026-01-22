import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentActivityPanel } from "./AgentActivityPanel";
import { AgentActivityLogProvider } from "@/hooks/useAgentActivityLog";

// Wrapper component to provide required context
function renderWithProviders(ui: React.ReactElement) {
  return render(<AgentActivityLogProvider>{ui}</AgentActivityLogProvider>);
}

describe("AgentActivityPanel", () => {
  it("renders the Agent Activity badge", () => {
    renderWithProviders(<AgentActivityPanel />);
    expect(screen.getByText("Agent Activity")).toBeInTheDocument();
  });

  it("renders with section aria-label", () => {
    renderWithProviders(<AgentActivityPanel />);
    expect(screen.getByRole("region", { name: "Agent Activity Panel" })).toBeInTheDocument();
  });

  it("renders empty state when no agent activity", () => {
    renderWithProviders(<AgentActivityPanel />);
    expect(screen.getByText("No agent activity")).toBeInTheDocument();
    expect(
      screen.getByText("Agent decisions will appear here when products are added to checkout.")
    ).toBeInTheDocument();
  });
});
