import crypto from "crypto";
import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const WEBHOOK_SECRET = "test-webhook-secret";
const ACP_URL = "http://localhost/api/webhooks/acp";
const UCP_URL = "http://localhost/api/webhooks/ucp";

let postAcpWebhook: typeof import("../acp/route").POST;
let postUcpWebhook: typeof import("../ucp/route").POST;

beforeAll(async () => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("WEBHOOK_SECRET", WEBHOOK_SECRET);

  ({ POST: postAcpWebhook } = await import("../acp/route"));
  ({ POST: postUcpWebhook } = await import("../ucp/route"));
});

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(() => {
  vi.unstubAllEnvs();
});

function createAcpBody(): string {
  return JSON.stringify({
    type: "shipping_update",
    data: {
      type: "shipping_update",
      checkout_session_id: "checkout_test",
      order_id: "order_test",
      status: "order_shipped",
      language: "en",
      subject: "Order shipped",
      message: "Your order is on its way.",
    },
  });
}

function createUcpBody(): string {
  return JSON.stringify({
    event_id: "event_test",
    created_time: new Date().toISOString(),
    order: {
      id: "order_test",
      checkout_id: "checkout_test",
    },
  });
}

function createUcpSignature(payload: string, requestUrl: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const claims = Buffer.from(
    JSON.stringify({
      iat: now,
      exp: now + 300,
      aud: new URL(requestUrl).host,
      htu: requestUrl,
      htm: "POST",
      body_sha256: crypto.createHash("sha256").update(payload).digest("hex"),
    })
  ).toString("base64url");
  const signingInput = `${header}.${claims}`;
  const signature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(signingInput)
    .digest("base64url");
  return `${signingInput}.${signature}`;
}

describe("webhook signature verification", () => {
  it("rejects an unsigned ACP webhook in development", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await postAcpWebhook(
      new NextRequest(ACP_URL, { method: "POST", body: createAcpBody() })
    );

    expect(response.status).toBe(401);
  });

  it("accepts a valid ACP signature in development", async () => {
    const body = createAcpBody();
    const timestamp = new Date().toISOString();
    const signature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(`${timestamp}.${body}`)
      .digest("hex");
    const response = await postAcpWebhook(
      new NextRequest(ACP_URL, {
        method: "POST",
        body,
        headers: {
          "X-Webhook-Signature": signature,
          "X-Webhook-Timestamp": timestamp,
        },
      })
    );

    expect(response.status).toBe(200);
  });

  it("rejects an unsigned UCP webhook in development", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await postUcpWebhook(
      new NextRequest(UCP_URL, { method: "POST", body: createUcpBody() })
    );

    expect(response.status).toBe(401);
  });

  it("accepts a valid UCP signature in development", async () => {
    const body = createUcpBody();
    const response = await postUcpWebhook(
      new NextRequest(UCP_URL, {
        method: "POST",
        body,
        headers: { "Request-Signature": createUcpSignature(body, UCP_URL) },
      })
    );

    expect(response.status).toBe(200);
  });
});
