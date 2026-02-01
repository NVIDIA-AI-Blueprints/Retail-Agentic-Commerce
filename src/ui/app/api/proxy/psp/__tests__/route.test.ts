import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from "vitest";
import { NextRequest } from "next/server";

// Route handlers - dynamically imported after env is set
let GET: typeof import("../[...path]/route").GET;
let POST: typeof import("../[...path]/route").POST;
let OPTIONS: typeof import("../[...path]/route").OPTIONS;

// Set up test environment BEFORE importing the route handlers
// (route.ts reads process.env at module load time)
const originalEnv = { ...process.env };

beforeAll(async () => {
  // Set env vars BEFORE dynamic import
  process.env.PSP_API_URL = "http://localhost:8001";
  process.env.PSP_API_KEY = "psp-api-key-12345";

  // Dynamic import AFTER env is configured
  const routeModule = await import("../[...path]/route");
  GET = routeModule.GET;
  POST = routeModule.POST;
  OPTIONS = routeModule.OPTIONS;
});

afterAll(() => {
  process.env = originalEnv;
});

// Helper to get fetch call with type safety
function getFetchCall(index: number = 0) {
  const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
  const call = mockFetch.mock.calls[index];
  if (!call) throw new Error(`No fetch call at index ${index}`);
  return call;
}

describe("PSP Proxy Route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  describe("SSRF Protection", () => {
    it("rejects path traversal attempts", async () => {
      const request = new NextRequest("http://localhost/api/proxy/psp/../../../etc/passwd");
      const params = { params: Promise.resolve({ path: ["..", "..", "..", "etc", "passwd"] }) };

      const response = await GET(request, params);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe("Invalid path");
    });

    it("rejects protocol injection with colon", async () => {
      const request = new NextRequest("http://localhost/api/proxy/psp/http:/evil.com");
      const params = { params: Promise.resolve({ path: ["http:", "evil.com"] }) };

      const response = await GET(request, params);
      expect(response.status).toBe(400);
    });

    it("rejects protocol-relative URLs", async () => {
      const request = new NextRequest("http://localhost/api/proxy/psp//evil.com/path");
      const params = { params: Promise.resolve({ path: ["//evil.com", "path"] }) };

      const response = await GET(request, params);
      expect(response.status).toBe(400);
    });

    it("allows valid path segments", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response('{"status":"ok"}', {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const request = new NextRequest(
        "http://localhost/api/proxy/psp/agentic_commerce/delegate_payment"
      );
      const params = {
        params: Promise.resolve({ path: ["agentic_commerce", "delegate_payment"] }),
      };

      const response = await GET(request, params);
      expect(response.status).toBe(200);
    });
  });

  describe("Header Forwarding", () => {
    it("forwards allowed headers and injects server-side auth", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response("{}", { status: 200 })
      );

      const request = new NextRequest(
        "http://localhost/api/proxy/psp/agentic_commerce/delegate_payment",
        {
          headers: {
            "Request-Id": "req_789",
            "Idempotency-Key": "idem_012",
            "API-Version": "2026-01-16",
            "Content-Type": "application/json",
            Accept: "application/json",
            // These should be stripped/replaced
            Authorization: "Bearer client-key-should-be-stripped",
          },
        }
      );
      const params = {
        params: Promise.resolve({ path: ["agentic_commerce", "delegate_payment"] }),
      };

      await GET(request, params);

      const fetchCall = getFetchCall();
      const headers = fetchCall[1].headers as Headers;

      // Allowed headers should be forwarded
      expect(headers.get("Request-Id")).toBe("req_789");
      expect(headers.get("Idempotency-Key")).toBe("idem_012");

      // Server-side auth should be injected (PSP key, not client key)
      expect(headers.get("Authorization")).toBe("Bearer psp-api-key-12345");
    });
  });

  describe("Query Parameter Preservation", () => {
    it("preserves query parameters in upstream URL", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response("{}", { status: 200 })
      );

      const request = new NextRequest(
        "http://localhost/api/proxy/psp/payment_intents?status=active"
      );
      const params = { params: Promise.resolve({ path: ["payment_intents"] }) };

      await GET(request, params);

      const fetchCall = getFetchCall();
      const url = fetchCall[0] as string;

      expect(url).toContain("?status=active");
    });
  });

  describe("Request Body Handling", () => {
    it("forwards request body as ArrayBuffer for POST", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response("{}", { status: 200 })
      );

      const body = JSON.stringify({
        payment_method: { type: "card" },
        allowance: { amount: 10000, currency: "USD" },
      });
      const request = new NextRequest(
        "http://localhost/api/proxy/psp/agentic_commerce/delegate_payment",
        {
          method: "POST",
          body: body,
          headers: { "Content-Type": "application/json" },
        }
      );
      const params = {
        params: Promise.resolve({ path: ["agentic_commerce", "delegate_payment"] }),
      };

      await POST(request, params);

      const fetchCall = getFetchCall();
      expect(fetchCall[1].method).toBe("POST");
      expect(fetchCall[1].body).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe("Empty Path Handling", () => {
    it("proxies to upstream root when path is empty", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response("{}", { status: 200 })
      );

      const request = new NextRequest("http://localhost/api/proxy/psp");
      const params = { params: Promise.resolve({ path: [] }) };

      await GET(request, params);

      const fetchCall = getFetchCall();
      const url = fetchCall[0] as string;

      expect(url).toBe("http://localhost:8001/");
    });
  });

  describe("OPTIONS Handler", () => {
    it("returns 204 without proxying upstream", async () => {
      const response = await OPTIONS();

      expect(response.status).toBe(204);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("Response Forwarding", () => {
    it("forwards upstream response status and body", async () => {
      const upstreamBody = JSON.stringify({
        id: "vt_123",
        status: "active",
        created: "2026-01-16T00:00:00Z",
      });
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(upstreamBody, {
          status: 201,
          statusText: "Created",
          headers: { "Content-Type": "application/json" },
        })
      );

      const request = new NextRequest(
        "http://localhost/api/proxy/psp/agentic_commerce/delegate_payment",
        {
          method: "POST",
          body: "{}",
          headers: { "Content-Type": "application/json" },
        }
      );
      const params = {
        params: Promise.resolve({ path: ["agentic_commerce", "delegate_payment"] }),
      };

      const response = await POST(request, params);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.id).toBe("vt_123");
      expect(data.status).toBe("active");
    });

    it("forwards upstream error responses", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify({ error: "Invalid payment method" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      );

      const request = new NextRequest(
        "http://localhost/api/proxy/psp/agentic_commerce/delegate_payment",
        {
          method: "POST",
          body: "{}",
          headers: { "Content-Type": "application/json" },
        }
      );
      const params = {
        params: Promise.resolve({ path: ["agentic_commerce", "delegate_payment"] }),
      };

      const response = await POST(request, params);

      expect(response.status).toBe(400);
    });
  });

  describe("Error Handling", () => {
    it("returns 502 on fetch error", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Connection refused"));

      const request = new NextRequest("http://localhost/api/proxy/psp/health");
      const params = { params: Promise.resolve({ path: ["health"] }) };

      const response = await GET(request, params);

      expect(response.status).toBe(502);
      const data = await response.json();
      expect(data.error).toBe("Upstream request failed");
    });
  });
});
