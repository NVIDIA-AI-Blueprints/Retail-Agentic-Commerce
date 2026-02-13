import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCheckoutSessionByProtocol,
  completeCheckoutByProtocol,
  type ProtocolSessionRef,
} from "./api-client";

describe("api-client protocol routing", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it("uses ACP endpoint when protocol is acp", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "cs_1",
          status: "not_ready_for_payment",
          currency: "usd",
          payment_provider: {
            provider: "stripe",
            supported_payment_methods: [
              { type: "card", supported_card_networks: ["visa", "mastercard"] },
            ],
          },
          line_items: [],
          fulfillment_options: [],
          totals: [],
          messages: [],
          links: [],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    await createCheckoutSessionByProtocol("acp", {
      items: [{ id: "prod_1", quantity: 1 }],
    });

    const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] ?? [];
    expect(url).toBe("/api/proxy/merchant/checkout_sessions");
  });

  it("uses A2A endpoint and normalizes UCP response", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          id: "req_1",
          result: {
            contextId: "ctx_123",
            parts: [
              {
                data: {
                  "a2a.ucp.checkout": {
                    id: "cs_ucp_1",
                    status: "ready_for_complete",
                    currency: "USD",
                    ucp: {
                      capabilities: {
                        "dev.ucp.shopping.checkout": [{ version: "2026-01-11" }],
                      },
                      payment_handlers: {
                        "com.example.processor_tokenizer": [{ id: "processor_tokenizer" }],
                      },
                    },
                    line_items: [
                      {
                        id: "li_1",
                        item: { id: "prod_1", title: "Test Shirt", price: 2500 },
                        quantity: 1,
                        totals: [
                          { type: "subtotal", label: "Subtotal", amount: 2500 },
                          { type: "tax", label: "Tax", amount: 200 },
                          { type: "total", label: "Total", amount: 2700 },
                        ],
                      },
                    ],
                    totals: [
                      { type: "subtotal", label: "Subtotal", amount: 2500 },
                      { type: "tax", label: "Tax", amount: 200 },
                      { type: "total", label: "Total", amount: 2700 },
                    ],
                    discounts: {
                      codes: ["SAVE10"],
                      applied: [
                        {
                          id: "applied_coupon_save10",
                          code: "SAVE10",
                          title: "Save 10%",
                          amount: 250,
                          automatic: false,
                          method: "each",
                          priority: 100,
                          allocations: [{ path: "$.line_items[0]", amount: 250 }],
                        },
                      ],
                    },
                    messages: [],
                  },
                },
              },
            ],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const session = await createCheckoutSessionByProtocol("ucp", {
      items: [{ id: "prod_1", quantity: 1 }],
    });

    expect(session.status).toBe("ready_for_payment");
    expect(session.protocol).toBe("ucp");
    expect(session.ucpContextId).toBe("ctx_123");
    expect(session.ucpRawStatus).toBe("ready_for_complete");
    expect(session.ucpPlatformProfileUrl).toBe("https://platform.example/profile");
    expect(session.ucpPaymentHandlerId).toBe("processor_tokenizer");
    expect(session.ucpPaymentHandlerIds).toEqual(["processor_tokenizer"]);
    expect(session.ucpPaymentHandlerNamespaces).toEqual(["com.example.processor_tokenizer"]);
    expect(session.capabilities?.extensions?.map((extension) => extension.name)).toEqual([
      "dev.ucp.shopping.checkout",
    ]);
    expect(session.discounts).toEqual({
      codes: ["SAVE10"],
      applied: [
        {
          id: "applied_coupon_save10",
          code: "SAVE10",
          coupon: { id: "applied_coupon_save10", name: "Save 10%" },
          amount: 250,
          automatic: false,
          method: "each",
          priority: 100,
          allocations: [{ path: "$.line_items[0]", amount: 250 }],
        },
      ],
      rejected: [],
    });

    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] ?? [];
    const headers = init.headers as Record<string, string>;
    expect(headers["UCP-Agent"]).toContain("profile=");
    expect(headers["X-A2A-Extensions"]).toBe("https://ucp.dev/2026-01-23/specification/reference/");

    const body = JSON.parse(String(init.body)) as {
      params: { message: { parts: Array<{ data?: Record<string, unknown> }> } };
    };
    const actionPart = body.params.message.parts[0]?.data;
    expect(actionPart?.line_items).toEqual([{ item: { id: "prod_1" }, quantity: 1 }]);
    expect(actionPart).not.toHaveProperty("items");
    expect(actionPart).not.toHaveProperty("coupons");
  });

  it("infers line-item discount from UCP subtotal", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          id: "req_discount",
          result: {
            contextId: "ctx_456",
            parts: [
              {
                data: {
                  "a2a.ucp.checkout": {
                    id: "cs_ucp_2",
                    status: "incomplete",
                    currency: "USD",
                    line_items: [
                      {
                        id: "li_2",
                        item: { id: "prod_2", title: "Classic Tee", price: 7500 },
                        quantity: 1,
                        totals: [
                          { type: "subtotal", label: "Subtotal", amount: 6750 },
                          { type: "tax", label: "Tax", amount: 675 },
                          { type: "total", label: "Total", amount: 7425 },
                        ],
                      },
                    ],
                    totals: [{ type: "total", label: "Total", amount: 7425 }],
                    messages: [],
                  },
                },
              },
            ],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const session = await createCheckoutSessionByProtocol("ucp", {
      items: [{ id: "prod_2", quantity: 1 }],
    });

    expect(session.line_items[0]?.base_amount).toBe(7500);
    expect(session.line_items[0]?.discount).toBe(750);
    expect(session.line_items[0]?.subtotal).toBe(6750);
  });

  it("sends tokenized payment instrument for UCP completion", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          id: "req_2",
          result: {
            contextId: "ctx_123",
            parts: [
              {
                data: {
                  "a2a.ucp.checkout": {
                    id: "cs_ucp_1",
                    status: "completed",
                    currency: "USD",
                    order: {
                      id: "order_ucp_123",
                      permalink_url: "https://shop.example.com/orders/order_ucp_123",
                    },
                    ucp: {
                      payment_handlers: {
                        "com.example.processor_tokenizer": [{ id: "processor_tokenizer" }],
                      },
                    },
                    line_items: [],
                    totals: [{ type: "total", label: "Total", amount: 2700 }],
                    messages: [],
                  },
                },
              },
            ],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const sessionRef: ProtocolSessionRef = {
      sessionId: "cs_ucp_1",
      contextId: "ctx_123",
      paymentHandlerId: "processor_tokenizer",
    };
    const session = await completeCheckoutByProtocol("ucp", sessionRef, {
      payment_data: {
        token: "vt_123",
        provider: "stripe",
      },
    });

    expect(session.order).toEqual({
      id: "order_ucp_123",
      checkout_session_id: "cs_ucp_1",
      permalink_url: "https://shop.example.com/orders/order_ucp_123",
    });

    const [, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] ?? [];
    const body = JSON.parse(String(init.body)) as {
      params: { message: { parts: Array<{ data?: Record<string, unknown> }> } };
    };
    const paymentPart = body.params.message.parts[1];
    expect(paymentPart?.data?.["a2a.ucp.checkout.payment"]).toEqual({
      instruments: [
        {
          id: "vt_123",
          type: "tokenized_card",
          handler_id: "processor_tokenizer",
          credential: { token: "vt_123" },
        },
      ],
    });
  });

  it("throws when UCP complete is called without negotiated payment handler", async () => {
    const sessionRef: ProtocolSessionRef = { sessionId: "cs_ucp_1", contextId: "ctx_123" };

    await expect(
      completeCheckoutByProtocol("ucp", sessionRef, {
        payment_data: {
          token: "vt_123",
          provider: "stripe",
        },
      })
    ).rejects.toMatchObject({
      code: "missing",
      message: "Missing negotiated UCP payment handler ID for checkout completion",
    });
  });

  it("throws APIError when A2A returns json-rpc error payload", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          jsonrpc: "2.0",
          id: "req_3",
          error: {
            code: -32602,
            message: "Invalid params",
            data: { detail: "Missing required header: UCP-Agent" },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    await expect(
      createCheckoutSessionByProtocol("ucp", {
        items: [{ id: "prod_1", quantity: 1 }],
      })
    ).rejects.toMatchObject({
      code: "jsonrpc_error",
    });
  });
});
