import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";
import type { Product } from "./types";

const mockProducts: Product[] = [
  {
    id: "prod_1",
    sku: "TS-001",
    name: "Classic Tee",
    basePrice: 2500,
    stockCount: 100,
    variant: "Black",
    size: "Large",
    imageUrl: "/prod_1.jpeg",
  },
  {
    id: "prod_2",
    sku: "TS-002",
    name: "V-Neck Tee",
    basePrice: 2800,
    stockCount: 50,
    variant: "Natural",
    size: "Large",
    imageUrl: "/prod_2.jpeg",
  },
  {
    id: "prod_3",
    sku: "TS-003",
    name: "Graphic Tee",
    basePrice: 3200,
    stockCount: 200,
    variant: "Grey",
    size: "Large",
    imageUrl: "/prod_3.jpeg",
  },
];

const defaultUser = {
  id: "user_demo123",
  name: "John Doe",
  email: "john@example.com",
  loyaltyPoints: 1250,
  tier: "Gold",
  memberSince: "2024-03-15",
};

let toolOutput = {
  products: mockProducts,
  user: defaultUser,
} as Record<string, unknown>;

const mockPersistedState = {
  cartItems: [],
  sessionId: null,
  currentPage: "browse",
  selectedProductId: null,
};

const setPersistedWidgetState = vi.fn();

vi.mock("@/hooks", () => ({
  useToolOutput: () => toolOutput,
  useWidgetState: <T,>() => [
    mockPersistedState as unknown as T,
    setPersistedWidgetState as unknown as (state: unknown) => void,
  ],
}));

describe("App", () => {
  beforeEach(() => {
    toolOutput = {
      products: mockProducts,
      user: defaultUser,
    };
    mockPersistedState.cartItems = [];
    mockPersistedState.sessionId = null;
    mockPersistedState.currentPage = "browse";
    mockPersistedState.selectedProductId = null;
    setPersistedWidgetState.mockReset();
  });

  it("renders products from toolOutput.products", () => {
    render(<App />);

    expect(screen.getByText("Classic Tee")).toBeInTheDocument();
    expect(screen.getByText("V-Neck Tee")).toBeInTheDocument();
    expect(screen.getByText("Graphic Tee")).toBeInTheDocument();
  });

  it("shows an empty state when no products are found", () => {
    toolOutput = {
      ...toolOutput,
      products: [],
      error: "No products found for 'dresses'.",
    };

    render(<App />);

    expect(screen.getByText("No products found")).toBeInTheDocument();
    expect(screen.getAllByText("No products found for 'dresses'.")).toHaveLength(2);
  });

  it("resets to browse state when a new search payload arrives", async () => {
    mockPersistedState.currentPage = "checkout";
    mockPersistedState.selectedProductId = "prod_1";

    const { rerender } = render(<App />);
    setPersistedWidgetState.mockClear();

    toolOutput = {
      ...toolOutput,
      products: [...mockProducts],
    };
    rerender(<App />);

    await waitFor(() => expect(setPersistedWidgetState).toHaveBeenCalled());

    const updaterCall = setPersistedWidgetState.mock.calls.find(
      ([arg]) => typeof arg === "function"
    );
    expect(updaterCall).toBeDefined();

    const updater = updaterCall?.[0] as (state: typeof mockPersistedState) => typeof mockPersistedState;
    const nextState = updater({
      ...mockPersistedState,
      currentPage: "checkout",
      selectedProductId: "prod_1",
    });

    expect(nextState.currentPage).toBe("browse");
    expect(nextState.selectedProductId).toBeNull();
  });
});
