import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCheckoutFlow } from "./useCheckoutFlow";
import type { Product, CheckoutSessionResponse } from "@/types";
import * as apiClient from "@/lib/api-client";

// Mock the API client module
vi.mock("@/lib/api-client", () => ({
  createCheckoutSession: vi.fn(),
  updateCheckoutSession: vi.fn(),
  completeCheckout: vi.fn(),
  delegatePayment: vi.fn(),
  generatePostPurchaseMessage: vi.fn(),
  postWebhookShippingUpdate: vi.fn(),
}));

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

  const mockSession: CheckoutSessionResponse = {
    id: "cs_test123",
    status: "not_ready_for_payment",
    currency: "usd",
    payment_provider: {
      provider: "stripe",
      supported_payment_methods: [
        { type: "card", supported_card_networks: ["visa", "mastercard"] },
      ],
    },
    line_items: [
      {
        id: "li_1",
        item: { id: "prod_1", quantity: 1 },
        name: "Test Shirt",
        base_amount: 2500,
        discount: 0,
        subtotal: 2500,
        tax: 200,
        total: 2700,
      },
    ],
    fulfillment_options: [
      {
        type: "shipping",
        id: "ship_standard",
        title: "Standard Shipping",
        subtitle: "5-7 business days",
        subtotal: 500,
        tax: 0,
        total: 500,
      },
      {
        type: "shipping",
        id: "ship_express",
        title: "Express Shipping",
        subtitle: "2-3 business days",
        subtotal: 1200,
        tax: 0,
        total: 1200,
      },
    ],
    totals: [
      { type: "subtotal", display_text: "Subtotal", amount: 2500 },
      { type: "fulfillment", display_text: "Shipping", amount: 500 },
      { type: "tax", display_text: "Tax", amount: 200 },
      { type: "total", display_text: "Total", amount: 3200 },
    ],
    messages: [],
    links: [],
  };

  const mockReadySession: CheckoutSessionResponse = {
    ...mockSession,
    status: "ready_for_payment",
  };

  const mockCompletedSession: CheckoutSessionResponse = {
    ...mockSession,
    status: "completed",
    order: {
      id: "order_xyz789",
      checkout_session_id: "cs_test123",
      permalink_url: "https://merchant.com/orders/xyz789",
    },
  };

  const mockVaultToken = {
    id: "vt_test123",
    created: new Date().toISOString(),
    metadata: {
      source: "agent_checkout",
      merchant_id: "merchant_nvshop",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

    it("has null session initially", () => {
      const { result } = renderHook(() => useCheckoutFlow());
      expect(result.current.context.session).toBeNull();
      expect(result.current.context.sessionId).toBeNull();
    });

    it("has no error initially", () => {
      const { result } = renderHook(() => useCheckoutFlow());
      expect(result.current.context.error).toBeNull();
    });

    it("is not loading initially", () => {
      const { result } = renderHook(() => useCheckoutFlow());
      expect(result.current.context.isLoading).toBe(false);
    });
  });

  describe("selectProduct - happy path", () => {
    it("sets loading state when selecting product", async () => {
      vi.mocked(apiClient.createCheckoutSession).mockResolvedValueOnce(mockSession);
      vi.mocked(apiClient.updateCheckoutSession).mockResolvedValueOnce(mockReadySession);

      const { result } = renderHook(() => useCheckoutFlow());

      act(() => {
        result.current.selectProduct(mockProduct);
      });

      expect(result.current.context.isLoading).toBe(true);
      expect(result.current.context.selectedProduct).toEqual(mockProduct);
    });

    it("creates checkout session and transitions to checkout state", async () => {
      vi.mocked(apiClient.createCheckoutSession).mockResolvedValueOnce(mockSession);
      vi.mocked(apiClient.updateCheckoutSession).mockResolvedValueOnce(mockReadySession);

      const { result } = renderHook(() => useCheckoutFlow());

      await act(async () => {
        await result.current.selectProduct(mockProduct);
      });

      await waitFor(() => {
        expect(result.current.context.state).toBe("checkout");
      });

      expect(result.current.context.sessionId).toBe("cs_test123");
      expect(result.current.context.session).toEqual(mockReadySession);
      expect(result.current.context.isLoading).toBe(false);
    });

    it("calls createCheckoutSession with correct parameters", async () => {
      vi.mocked(apiClient.createCheckoutSession).mockResolvedValueOnce(mockSession);
      vi.mocked(apiClient.updateCheckoutSession).mockResolvedValueOnce(mockReadySession);

      const { result } = renderHook(() => useCheckoutFlow());

      await act(async () => {
        await result.current.selectProduct(mockProduct);
      });

      expect(apiClient.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [{ id: "prod_1", quantity: 1 }],
          buyer: expect.any(Object),
          fulfillment_address: expect.any(Object),
        })
      );
    });
  });

  describe("selectProduct - error handling", () => {
    it("sets error state on API failure", async () => {
      const mockError = {
        type: "invalid_request",
        code: "product_not_found",
        message: "Product not found",
      };
      vi.mocked(apiClient.createCheckoutSession).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useCheckoutFlow());

      await act(async () => {
        await result.current.selectProduct(mockProduct);
      });

      await waitFor(() => {
        expect(result.current.context.state).toBe("error");
      });

      expect(result.current.context.error).toEqual(mockError);
      expect(result.current.context.isLoading).toBe(false);
    });

    it("clears error when clearError is called", async () => {
      const mockError = {
        type: "invalid_request",
        code: "product_not_found",
        message: "Product not found",
      };
      vi.mocked(apiClient.createCheckoutSession).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useCheckoutFlow());

      await act(async () => {
        await result.current.selectProduct(mockProduct);
      });

      await waitFor(() => {
        expect(result.current.context.error).not.toBeNull();
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.context.error).toBeNull();
    });
  });

  describe("updateQuantity", () => {
    it("updates quantity locally", async () => {
      vi.mocked(apiClient.createCheckoutSession).mockResolvedValueOnce(mockSession);
      vi.mocked(apiClient.updateCheckoutSession).mockResolvedValue(mockReadySession);

      const { result } = renderHook(() => useCheckoutFlow());

      await act(async () => {
        await result.current.selectProduct(mockProduct);
      });

      await waitFor(() => {
        expect(result.current.context.state).toBe("checkout");
      });

      await act(async () => {
        await result.current.updateQuantity(3);
      });

      expect(result.current.context.quantity).toBe(3);
    });

    it("enforces minimum quantity of 1", async () => {
      vi.mocked(apiClient.createCheckoutSession).mockResolvedValueOnce(mockSession);
      vi.mocked(apiClient.updateCheckoutSession).mockResolvedValue(mockReadySession);

      const { result } = renderHook(() => useCheckoutFlow());

      await act(async () => {
        await result.current.selectProduct(mockProduct);
      });

      await waitFor(() => {
        expect(result.current.context.state).toBe("checkout");
      });

      await act(async () => {
        await result.current.updateQuantity(0);
      });

      expect(result.current.context.quantity).toBe(1);
    });

    it("enforces maximum quantity of 10", async () => {
      vi.mocked(apiClient.createCheckoutSession).mockResolvedValueOnce(mockSession);
      vi.mocked(apiClient.updateCheckoutSession).mockResolvedValue(mockReadySession);

      const { result } = renderHook(() => useCheckoutFlow());

      await act(async () => {
        await result.current.selectProduct(mockProduct);
      });

      await waitFor(() => {
        expect(result.current.context.state).toBe("checkout");
      });

      await act(async () => {
        await result.current.updateQuantity(15);
      });

      expect(result.current.context.quantity).toBe(10);
    });
  });

  describe("selectShipping", () => {
    it("updates selected shipping option", async () => {
      vi.mocked(apiClient.createCheckoutSession).mockResolvedValueOnce(mockSession);
      vi.mocked(apiClient.updateCheckoutSession).mockResolvedValue(mockReadySession);

      const { result } = renderHook(() => useCheckoutFlow());

      await act(async () => {
        await result.current.selectProduct(mockProduct);
      });

      await waitFor(() => {
        expect(result.current.context.state).toBe("checkout");
      });

      await act(async () => {
        await result.current.selectShipping("ship_express");
      });

      expect(result.current.context.selectedShippingId).toBe("ship_express");
    });
  });

  // Mock payment and billing data for tests
  const mockPaymentInfo = {
    cardNumber: "4242424242424242",
    expirationDate: "12/28",
    securityCode: "123",
  };

  const mockBillingAddress = {
    fullName: "John Doe",
    address: "123 Main St, San Francisco, CA 94102",
    preferredLanguage: "en" as const,
  };

  describe("submitPayment - happy path", () => {
    it("transitions to processing state", async () => {
      vi.mocked(apiClient.createCheckoutSession).mockResolvedValueOnce(mockSession);
      vi.mocked(apiClient.updateCheckoutSession).mockResolvedValue(mockReadySession);
      vi.mocked(apiClient.delegatePayment).mockResolvedValueOnce(mockVaultToken);
      vi.mocked(apiClient.completeCheckout).mockResolvedValueOnce(mockCompletedSession);

      const { result } = renderHook(() => useCheckoutFlow());

      await act(async () => {
        await result.current.selectProduct(mockProduct);
      });

      await waitFor(() => {
        expect(result.current.context.state).toBe("checkout");
      });

      // Set payment info and billing address (required for submitPayment)
      act(() => {
        result.current.setPaymentInfo(mockPaymentInfo);
        result.current.setBillingAddress(mockBillingAddress);
      });

      act(() => {
        result.current.submitPayment();
      });

      expect(result.current.context.state).toBe("processing");
    });

    it("completes payment and transitions to confirmation", async () => {
      vi.mocked(apiClient.createCheckoutSession).mockResolvedValueOnce(mockSession);
      vi.mocked(apiClient.updateCheckoutSession).mockResolvedValue(mockReadySession);
      vi.mocked(apiClient.delegatePayment).mockResolvedValueOnce(mockVaultToken);
      vi.mocked(apiClient.completeCheckout).mockResolvedValueOnce(mockCompletedSession);

      const { result } = renderHook(() => useCheckoutFlow());

      await act(async () => {
        await result.current.selectProduct(mockProduct);
      });

      await waitFor(() => {
        expect(result.current.context.state).toBe("checkout");
      });

      // Set payment info and billing address (required for submitPayment)
      act(() => {
        result.current.setPaymentInfo(mockPaymentInfo);
        result.current.setBillingAddress(mockBillingAddress);
      });

      await act(async () => {
        await result.current.submitPayment();
      });

      await waitFor(() => {
        expect(result.current.context.state).toBe("confirmation");
      });

      expect(result.current.context.orderId).toBe("order_xyz789");
      expect(result.current.context.session?.order?.permalink_url).toBe(
        "https://merchant.com/orders/xyz789"
      );
    });

    it("stores vault token after delegation", async () => {
      vi.mocked(apiClient.createCheckoutSession).mockResolvedValueOnce(mockSession);
      vi.mocked(apiClient.updateCheckoutSession).mockResolvedValue(mockReadySession);
      vi.mocked(apiClient.delegatePayment).mockResolvedValueOnce(mockVaultToken);
      vi.mocked(apiClient.completeCheckout).mockResolvedValueOnce(mockCompletedSession);

      const { result } = renderHook(() => useCheckoutFlow());

      await act(async () => {
        await result.current.selectProduct(mockProduct);
      });

      await waitFor(() => {
        expect(result.current.context.state).toBe("checkout");
      });

      // Set payment info and billing address (required for submitPayment)
      act(() => {
        result.current.setPaymentInfo(mockPaymentInfo);
        result.current.setBillingAddress(mockBillingAddress);
      });

      await act(async () => {
        await result.current.submitPayment();
      });

      await waitFor(() => {
        expect(result.current.context.vaultToken).toBe("vt_test123");
      });
    });
  });

  describe("submitPayment - error handling", () => {
    it("sets error state on payment delegation failure", async () => {
      vi.mocked(apiClient.createCheckoutSession).mockResolvedValueOnce(mockSession);
      vi.mocked(apiClient.updateCheckoutSession).mockResolvedValue(mockReadySession);
      vi.mocked(apiClient.delegatePayment).mockRejectedValueOnce({
        type: "invalid_request",
        code: "payment_declined",
        message: "Card was declined",
      });

      const { result } = renderHook(() => useCheckoutFlow());

      await act(async () => {
        await result.current.selectProduct(mockProduct);
      });

      await waitFor(() => {
        expect(result.current.context.state).toBe("checkout");
      });

      // Set payment info and billing address (required for submitPayment)
      act(() => {
        result.current.setPaymentInfo(mockPaymentInfo);
        result.current.setBillingAddress(mockBillingAddress);
      });

      await act(async () => {
        await result.current.submitPayment();
      });

      await waitFor(() => {
        expect(result.current.context.state).toBe("error");
      });

      expect(result.current.context.error?.code).toBe("payment_declined");
    });
  });

  describe("reset", () => {
    it("resets all state to initial values", async () => {
      vi.mocked(apiClient.createCheckoutSession).mockResolvedValueOnce(mockSession);
      vi.mocked(apiClient.updateCheckoutSession).mockResolvedValue(mockReadySession);
      vi.mocked(apiClient.delegatePayment).mockResolvedValueOnce(mockVaultToken);
      vi.mocked(apiClient.completeCheckout).mockResolvedValueOnce(mockCompletedSession);

      const { result } = renderHook(() => useCheckoutFlow());

      await act(async () => {
        await result.current.selectProduct(mockProduct);
      });

      await waitFor(() => {
        expect(result.current.context.state).toBe("checkout");
      });

      // Set payment info and billing address (required for submitPayment)
      act(() => {
        result.current.setPaymentInfo(mockPaymentInfo);
        result.current.setBillingAddress(mockBillingAddress);
      });

      await act(async () => {
        await result.current.submitPayment();
      });

      await waitFor(() => {
        expect(result.current.context.state).toBe("confirmation");
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.context.state).toBe("product_selection");
      expect(result.current.context.selectedProduct).toBeNull();
      expect(result.current.context.session).toBeNull();
      expect(result.current.context.sessionId).toBeNull();
      expect(result.current.context.vaultToken).toBeNull();
      expect(result.current.context.orderId).toBeNull();
      expect(result.current.context.error).toBeNull();
      expect(result.current.context.isLoading).toBe(false);
    });
  });
});
