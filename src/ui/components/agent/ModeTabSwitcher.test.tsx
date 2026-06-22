import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ModeTabSwitcher, type CheckoutMode } from "./ModeTabSwitcher";

describe("ModeTabSwitcher", () => {
  it("marks the active mode as selected", () => {
    render(<ModeTabSwitcher activeMode="native" onModeChange={vi.fn()} />);

    expect(screen.getByRole("tab", { name: "Native" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Apps SDK" })).toHaveAttribute("aria-selected", "false");
  });

  it("updates selection immediately when Apps SDK is clicked", () => {
    const onModeChange = vi.fn();
    render(<ModeTabSwitcher activeMode="native" onModeChange={onModeChange} />);

    const appsSdkTab = screen.getByRole("tab", { name: "Apps SDK" });
    fireEvent.click(appsSdkTab);

    expect(appsSdkTab).toHaveAttribute("aria-selected", "true");
    expect(onModeChange).toHaveBeenCalledWith("apps-sdk");
  });

  it("updates selection on mouse down before click handling completes", () => {
    const onModeChange = vi.fn();
    render(<ModeTabSwitcher activeMode="native" onModeChange={onModeChange} />);

    const appsSdkTab = screen.getByRole("tab", { name: "Apps SDK" });
    fireEvent.mouseDown(appsSdkTab, { button: 0 });

    expect(appsSdkTab).toHaveAttribute("aria-selected", "true");
    expect(onModeChange).toHaveBeenCalledWith("apps-sdk");
  });

  it("does not request the same mode twice during a full mouse click sequence", () => {
    const onModeChange = vi.fn();
    render(<ModeTabSwitcher activeMode="native" onModeChange={onModeChange} />);

    const appsSdkTab = screen.getByRole("tab", { name: "Apps SDK" });
    fireEvent.mouseDown(appsSdkTab, { button: 0 });
    fireEvent.click(appsSdkTab);

    expect(onModeChange).toHaveBeenCalledTimes(1);
  });

  it("supports keyboard activation", () => {
    const onModeChange = vi.fn();
    render(<ModeTabSwitcher activeMode="native" onModeChange={onModeChange} />);

    const appsSdkTab = screen.getByRole("tab", { name: "Apps SDK" });
    fireEvent.keyDown(appsSdkTab, { key: "Enter" });

    expect(appsSdkTab).toHaveAttribute("aria-selected", "true");
    expect(onModeChange).toHaveBeenCalledWith("apps-sdk");
  });

  it("syncs selection when the parent mode changes", () => {
    const Wrapper = ({ mode }: { mode: CheckoutMode }) => (
      <ModeTabSwitcher activeMode={mode} onModeChange={vi.fn()} />
    );
    const { rerender } = render(<Wrapper mode="native" />);

    rerender(<Wrapper mode="apps-sdk" />);

    expect(screen.getByRole("tab", { name: "Apps SDK" })).toHaveAttribute("aria-selected", "true");
  });
});
