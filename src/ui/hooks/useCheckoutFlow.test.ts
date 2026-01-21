import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCheckoutFlow } from "./useCheckoutFlow";
import type { Product } from "@/types";

describe("useCheckoutFlow", () => {
  const mockProduct: Product = {
    id: "prod_1",
    sku: "TS-001",
    name: "Test Shirt",
    description: "A test shirt",
    basePrice: 2500,
    stockCount: 100,
    minMargin: 0.15,
    imageUrl: "/shirt.jpeg",
    variant: "Black",
    size: "Large",
  };

  describe("initial state", () => {
    it("starts in product_selection state", () => {
      const { result } = renderHook(() => useCheckoutFlow());
      expect(result.current.context.state).toBe("product_selection");
    });

    it("has null selectedProduct initially", () => {
      const { result } = renderHook(() => useCheckoutFlow());
      expect(result.current.context.selectedProduct).toBeNull();
    });

    it("has default quantity of 1", () => {
      const { result } = renderHook(() => useCheckoutFlow());
      expect(result.current.context.quantity).toBe(1);
    });

    it("has default shipping option selected", () => {
      const { result } = renderHook(() => useCheckoutFlow());
      expect(result.current.context.selectedShippingId).toBe("shipping_standard");
    });
  });

  describe("SELECT_PRODUCT action", () => {
    it("transitions to checkout state", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      act(() => {
        result.current.selectProduct(mockProduct);
      });

      expect(result.current.context.state).toBe("checkout");
    });

    it("sets the selected product", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      act(() => {
        result.current.selectProduct(mockProduct);
      });

      expect(result.current.context.selectedProduct).toEqual(mockProduct);
    });

    it("resets quantity to 1", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      act(() => {
        result.current.selectProduct(mockProduct);
      });

      expect(result.current.context.quantity).toBe(1);
    });

    it("does not transition from invalid states", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      // First, go to checkout
      act(() => {
        result.current.selectProduct(mockProduct);
      });

      // Then try to select another product (should not work while in checkout)
      const anotherProduct = { ...mockProduct, id: "prod_2", name: "Another Shirt" };
      act(() => {
        result.current.selectProduct(anotherProduct);
      });

      // Should still be the first product
      expect(result.current.context.selectedProduct).toEqual(mockProduct);
    });
  });

  describe("UPDATE_QUANTITY action", () => {
    it("updates quantity in checkout state", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      act(() => {
        result.current.selectProduct(mockProduct);
      });

      act(() => {
        result.current.updateQuantity(3);
      });

      expect(result.current.context.quantity).toBe(3);
    });

    it("enforces minimum quantity of 1", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      act(() => {
        result.current.selectProduct(mockProduct);
      });

      act(() => {
        result.current.updateQuantity(0);
      });

      expect(result.current.context.quantity).toBe(1);
    });

    it("enforces maximum quantity of 10", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      act(() => {
        result.current.selectProduct(mockProduct);
      });

      act(() => {
        result.current.updateQuantity(15);
      });

      expect(result.current.context.quantity).toBe(10);
    });

    it("does not update quantity outside checkout state", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      act(() => {
        result.current.updateQuantity(5);
      });

      expect(result.current.context.quantity).toBe(1);
    });
  });

  describe("SELECT_SHIPPING action", () => {
    it("updates selected shipping in checkout state", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      act(() => {
        result.current.selectProduct(mockProduct);
      });

      act(() => {
        result.current.selectShipping("shipping_express");
      });

      expect(result.current.context.selectedShippingId).toBe("shipping_express");
    });

    it("does not update shipping outside checkout state", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      act(() => {
        result.current.selectShipping("shipping_express");
      });

      expect(result.current.context.selectedShippingId).toBe("shipping_standard");
    });
  });

  describe("SUBMIT_PAYMENT action", () => {
    it("transitions from checkout to processing", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      act(() => {
        result.current.selectProduct(mockProduct);
      });

      act(() => {
        result.current.submitPayment();
      });

      expect(result.current.context.state).toBe("processing");
    });

    it("does not transition from product_selection", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      act(() => {
        result.current.submitPayment();
      });

      expect(result.current.context.state).toBe("product_selection");
    });
  });

  describe("PAYMENT_COMPLETE action", () => {
    it("transitions from processing to confirmation", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      act(() => {
        result.current.selectProduct(mockProduct);
      });

      act(() => {
        result.current.submitPayment();
      });

      act(() => {
        result.current.completePayment("ORD-12345");
      });

      expect(result.current.context.state).toBe("confirmation");
    });

    it("sets the order ID", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      act(() => {
        result.current.selectProduct(mockProduct);
      });

      act(() => {
        result.current.submitPayment();
      });

      act(() => {
        result.current.completePayment("ORD-12345");
      });

      expect(result.current.context.orderId).toBe("ORD-12345");
    });

    it("does not transition from checkout", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      act(() => {
        result.current.selectProduct(mockProduct);
      });

      act(() => {
        result.current.completePayment("ORD-12345");
      });

      expect(result.current.context.state).toBe("checkout");
      expect(result.current.context.orderId).toBeNull();
    });
  });

  describe("RESET action", () => {
    it("transitions from confirmation back to product_selection", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      // Go through the entire flow
      act(() => {
        result.current.selectProduct(mockProduct);
      });

      act(() => {
        result.current.submitPayment();
      });

      act(() => {
        result.current.completePayment("ORD-12345");
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.context.state).toBe("product_selection");
    });

    it("resets all context values", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      // Go through the flow with modifications
      act(() => {
        result.current.selectProduct(mockProduct);
      });

      act(() => {
        result.current.updateQuantity(5);
      });

      act(() => {
        result.current.selectShipping("shipping_express");
      });

      act(() => {
        result.current.submitPayment();
      });

      act(() => {
        result.current.completePayment("ORD-12345");
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.context).toEqual({
        state: "product_selection",
        selectedProduct: null,
        quantity: 1,
        selectedShippingId: "shipping_standard",
        orderId: null,
      });
    });

    it("does not reset from checkout state", () => {
      const { result } = renderHook(() => useCheckoutFlow());

      act(() => {
        result.current.selectProduct(mockProduct);
      });

      act(() => {
        result.current.reset();
      });

      // Should still be in checkout with product selected
      expect(result.current.context.state).toBe("checkout");
      expect(result.current.context.selectedProduct).toEqual(mockProduct);
    });
  });
});
