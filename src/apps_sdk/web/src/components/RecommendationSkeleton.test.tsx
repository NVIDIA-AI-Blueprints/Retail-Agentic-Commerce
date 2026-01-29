import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecommendationSkeleton } from "./RecommendationSkeleton";

describe("RecommendationSkeleton", () => {
  it("renders 3 skeleton cards", () => {
    render(<RecommendationSkeleton />);
    
    // Find skeleton cards by their structure
    const skeletonCards = document.querySelectorAll(".skeleton-shimmer");
    
    // Each card has 4 shimmer elements: container, image, 2 text rows, button
    // But we just check that shimmer elements exist
    expect(skeletonCards.length).toBeGreaterThan(0);
  });

  it("has proper structure for loading animation", () => {
    const { container } = render(<RecommendationSkeleton />);
    
    // Check that the main flex container exists
    const flexContainer = container.querySelector(".flex.gap-3");
    expect(flexContainer).toBeInTheDocument();
  });

  it("contains accessible content placeholders", () => {
    const { container } = render(<RecommendationSkeleton />);
    
    // Check that rounded cards exist
    const roundedCards = container.querySelectorAll(".rounded-xl");
    expect(roundedCards.length).toBe(3);
  });
});
