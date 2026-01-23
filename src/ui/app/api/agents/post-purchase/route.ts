/**
 * Post-Purchase Agent Proxy API Route
 *
 * This route proxies requests to the NAT Post-Purchase Agent running on port 8003.
 * This is necessary because the NAT agent doesn't have CORS headers configured,
 * so browser requests would be blocked.
 */

/* eslint-disable no-console */

import { NextRequest, NextResponse } from "next/server";

const POST_PURCHASE_AGENT_URL = process.env.POST_PURCHASE_AGENT_URL || "http://localhost:8003";

/**
 * Brand persona for post-purchase messages
 */
interface BrandPersona {
  company_name: string;
  tone: "friendly" | "professional" | "casual" | "urgent";
  preferred_language: "en" | "es" | "fr";
}

/**
 * Order context for post-purchase messages
 */
interface OrderContext {
  order_id: string;
  customer_name: string;
  product_name: string;
  tracking_url: string | null;
  estimated_delivery: string;
}

/**
 * Post-purchase message request
 */
interface PostPurchaseMessageRequest {
  brand_persona: BrandPersona;
  order: OrderContext;
  status: "order_confirmed" | "order_shipped" | "out_for_delivery" | "delivered";
}

/**
 * POST /api/agents/post-purchase
 *
 * Proxies the request to the NAT Post-Purchase Agent
 */
export async function POST(request: NextRequest) {
  try {
    const body: PostPurchaseMessageRequest = await request.json();

    // Validate required fields
    if (!body.brand_persona || !body.order || !body.status) {
      return NextResponse.json(
        { error: "Missing required fields: brand_persona, order, status" },
        { status: 400 }
      );
    }

    // Call the NAT agent
    const response = await fetch(`${POST_PURCHASE_AGENT_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: JSON.stringify(body),
      }),
    });

    if (!response.ok) {
      console.error("[PostPurchase] Agent returned error:", response.status, await response.text());
      return NextResponse.json(
        { error: `Agent error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // NAT agent returns { value: "json string" }
    try {
      const parsed = JSON.parse(data.value);
      return NextResponse.json(parsed);
    } catch {
      console.error("[PostPurchase] Failed to parse agent response:", data);
      return NextResponse.json({ error: "Failed to parse agent response" }, { status: 500 });
    }
  } catch (error) {
    console.error("[PostPurchase] Proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
