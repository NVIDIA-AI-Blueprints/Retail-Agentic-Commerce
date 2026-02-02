import { describe, it, expect, vi, beforeEach } from "vitest";
 import { render, screen } from "@testing-library/react";
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
 
const toolOutput = {
  products: mockProducts,
  user: {
    id: "user_demo123",
    name: "John Doe",
    email: "john@example.com",
    loyaltyPoints: 1250,
    tier: "Gold",
    memberSince: "2024-03-15",
  },
} as Record<string, unknown>;

vi.mock("@/hooks", () => ({
  useToolOutput: () => toolOutput,
}));
 
 describe("App", () => {
  beforeEach(() => {
    toolOutput.products = mockProducts;
    toolOutput.error = undefined;
  });

   it("renders products from toolOutput.products", () => {
     render(<App />);
 
     expect(screen.getByText("Classic Tee")).toBeInTheDocument();
     expect(screen.getByText("V-Neck Tee")).toBeInTheDocument();
     expect(screen.getByText("Graphic Tee")).toBeInTheDocument();
   });

  it("shows an empty state when no products are found", () => {
    toolOutput.products = [];
    toolOutput.error = "No products found for 'dresses'.";

    render(<App />);

    expect(screen.getByText("No products found")).toBeInTheDocument();
    expect(screen.getByText("No products found for 'dresses'.")).toBeInTheDocument();
  });
 });
