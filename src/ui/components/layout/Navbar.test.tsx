import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "./Navbar";

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

describe("Navbar", () => {
  it("renders the NVIDIA logo", () => {
    render(<Navbar />);
    const logo = screen.getByAltText("NVIDIA Logo");
    expect(logo).toBeInTheDocument();
  });

  it("renders the Agentic Commerce title", () => {
    render(<Navbar />);
    const title = screen.getByText("Agentic Commerce");
    expect(title).toBeInTheDocument();
  });

  it("has proper styling with border", () => {
    const { container } = render(<Navbar />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("border-b");
  });
});
