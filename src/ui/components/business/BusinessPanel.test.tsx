import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BusinessPanel } from "./BusinessPanel";
import { ACPLogProvider } from "@/hooks/useACPLog";

// Wrapper component to provide required context
function renderWithProviders(ui: React.ReactElement) {
  return render(<ACPLogProvider>{ui}</ACPLogProvider>);
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
    // New simplified empty state with waiting message
    expect(screen.getByText("No active session")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Select a product from the Client Agent panel to start an ACP checkout session."
      )
    ).toBeInTheDocument();
  });

  it("renders Simulate API button in header", () => {
    renderWithProviders(<BusinessPanel />);
    expect(screen.getByRole("button", { name: "Simulate API" })).toBeInTheDocument();
  });
});
