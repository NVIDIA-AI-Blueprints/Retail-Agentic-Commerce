import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_FULFILLMENT_ADDRESS,
  syncCheckoutSessionWithDefaultShipping,
} from "@/checkout-session-sync";
import type { ACPSessionResponse, CartItem } from "@/types";

const CART_ITEMS: CartItem[] = [
  {
    id: "prod_1",
    name: "Classic Tee",
    basePrice: 2500,
    quantity: 1,
  },
];

function buildSession(
  overrides: Partial<ACPSessionResponse>
): ACPSessionResponse {
  return {
    id: "cs_test_123",
    status: "not_ready_for_payment",
    currency: "usd",
    line_items: [],
    totals: [],
    ...overrides,
  };
}

describe("syncCheckoutSessionWithDefaultShipping", () => {
  it("defaults to shipping_standard when updating a session without selection", async () => {
    const callTool = vi
      .fn()
      .mockResolvedValueOnce(
        buildSession({
          fulfillment_option_id: null,
          fulfillment_options: [
            {
              id: "shipping_standard",
              type: "shipping",
              title: "Standard Shipping",
              subtitle: "5-7 business days",
              subtotal: 599,
              tax: 0,
              total: 599,
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        buildSession({
          fulfillment_option_id: "shipping_standard",
          fulfillment_options: [
            {
              id: "shipping_standard",
              type: "shipping",
              title: "Standard Shipping",
              subtitle: "5-7 business days",
              subtotal: 599,
              tax: 0,
              total: 599,
            },
          ],
          totals: [
            { type: "subtotal", display_text: "Subtotal", amount: 2500 },
            { type: "fulfillment", display_text: "Shipping", amount: 599 },
            { type: "total", display_text: "Total", amount: 3349 },
          ],
        })
      );

    const result = await syncCheckoutSessionWithDefaultShipping({
      items: CART_ITEMS,
      currentSessionId: "cs_test_123",
      callTool,
    });

    expect(callTool).toHaveBeenNthCalledWith(1, "update-checkout-session", {
      sessionId: "cs_test_123",
      items: [{ id: "prod_1", quantity: 1 }],
      fulfillmentAddress: DEFAULT_FULFILLMENT_ADDRESS,
    });
    expect(callTool).toHaveBeenNthCalledWith(2, "update-checkout-session", {
      sessionId: "cs_test_123",
      fulfillmentOptionId: "shipping_standard",
      fulfillmentAddress: DEFAULT_FULFILLMENT_ADDRESS,
    });
    expect(result.sessionData?.fulfillment_option_id).toBe("shipping_standard");
  });

  it("preserves existing backend shipping selection during session updates", async () => {
    const callTool = vi.fn().mockResolvedValue(
      buildSession({
        fulfillment_option_id: "shipping_express",
        fulfillment_options: [
          {
            id: "shipping_standard",
            type: "shipping",
            title: "Standard Shipping",
            subtitle: "5-7 business days",
            subtotal: 599,
            tax: 0,
            total: 599,
          },
          {
            id: "shipping_express",
            type: "shipping",
            title: "Express Shipping",
            subtitle: "2-3 business days",
            subtotal: 1299,
            tax: 0,
            total: 1299,
          },
        ],
      })
    );

    const result = await syncCheckoutSessionWithDefaultShipping({
      items: CART_ITEMS,
      currentSessionId: "cs_test_123",
      callTool,
    });

    expect(callTool).toHaveBeenCalledTimes(1);
    expect(result.sessionData?.fulfillment_option_id).toBe("shipping_express");
  });

  it("creates a new session and selects standard shipping when create returns no default selection", async () => {
    const callTool = vi
      .fn()
      .mockResolvedValueOnce(
        buildSession({
          id: "cs_new_456",
          fulfillment_option_id: null,
          fulfillment_options: [
            {
              id: "shipping_standard",
              type: "shipping",
              title: "Standard Shipping",
              subtitle: "5-7 business days",
              subtotal: 599,
              tax: 0,
              total: 599,
            },
            {
              id: "shipping_express",
              type: "shipping",
              title: "Express Shipping",
              subtitle: "2-3 business days",
              subtotal: 1299,
              tax: 0,
              total: 1299,
            },
          ],
        })
      )
      .mockResolvedValueOnce(
        buildSession({
          id: "cs_new_456",
          fulfillment_option_id: "shipping_standard",
          fulfillment_options: [
            {
              id: "shipping_standard",
              type: "shipping",
              title: "Standard Shipping",
              subtitle: "5-7 business days",
              subtotal: 599,
              tax: 0,
              total: 599,
            },
            {
              id: "shipping_express",
              type: "shipping",
              title: "Express Shipping",
              subtitle: "2-3 business days",
              subtotal: 1299,
              tax: 0,
              total: 1299,
            },
          ],
          totals: [
            { type: "subtotal", display_text: "Subtotal", amount: 2500 },
            { type: "fulfillment", display_text: "Shipping", amount: 599 },
            { type: "total", display_text: "Total", amount: 3349 },
          ],
        })
      );

    const result = await syncCheckoutSessionWithDefaultShipping({
      items: CART_ITEMS,
      currentSessionId: null,
      callTool,
    });

    expect(callTool).toHaveBeenNthCalledWith(1, "create-checkout-session", {
      items: [{ id: "prod_1", quantity: 1 }],
      buyer: {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
      },
      fulfillmentAddress: DEFAULT_FULFILLMENT_ADDRESS,
    });
    expect(callTool).toHaveBeenNthCalledWith(2, "update-checkout-session", {
      sessionId: "cs_new_456",
      fulfillmentOptionId: "shipping_standard",
      fulfillmentAddress: DEFAULT_FULFILLMENT_ADDRESS,
    });
    expect(result.sessionId).toBe("cs_new_456");
    expect(result.sessionData?.totals).toEqual([
      { type: "subtotal", display_text: "Subtotal", amount: 2500 },
      { type: "fulfillment", display_text: "Shipping", amount: 599 },
      { type: "total", display_text: "Total", amount: 3349 },
    ]);
  });
});
