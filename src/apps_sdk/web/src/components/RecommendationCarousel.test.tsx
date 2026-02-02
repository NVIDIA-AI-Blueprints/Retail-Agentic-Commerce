 import { describe, it, expect, vi } from "vitest";
 import { render, screen } from "@testing-library/react";
 import { RecommendationCarousel } from "./RecommendationCarousel";
 import type { Product } from "@/types";
 
 describe("RecommendationCarousel", () => {
   it("renders a fallback label when variant and size are missing", () => {
     const products: Product[] = [
       {
         id: "prod_1",
         sku: "TS-001",
         name: "Classic Tee",
         basePrice: 2500,
         stockCount: 100,
       },
     ];
 
     render(
       <RecommendationCarousel
         products={products}
         onAddToCart={vi.fn()}
         onProductClick={vi.fn()}
       />
     );
 
     expect(screen.getByText("Standard")).toBeInTheDocument();
   });
 });
