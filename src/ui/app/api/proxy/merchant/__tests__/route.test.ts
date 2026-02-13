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
  process.env.MERCHANT_API_URL = "http://localhost:8000";
  process.env.MERCHANT_API_KEY = "test-api-key";

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

describe("Merchant Proxy Route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  describe("SSRF Protection", () => {
    it("rejects path traversal attempts", async () => {
      const request = new NextRequest("http://localhost/api/proxy/merchant/../../../etc/passwd");
      const params = { params: Promise.resolve({ path: ["..", "..", "..", "etc", "passwd"] }) };

      const response = await GET(request, params);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe("Invalid path");
    });

    it("rejects protocol injection with colon", async () => {
      const request = new NextRequest("http://localhost/api/proxy/merchant/http:/evil.com");
      const params = { params: Promise.resolve({ path: ["http:", "evil.com"] }) };

      const response = await GET(request, params);
      expect(response.status).toBe(400);
    });

    it("rejects protocol-relative URLs", async () => {
      const request = new NextRequest("http://localhost/api/proxy/merchant//evil.com/path");
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
        "http://localhost/api/proxy/merchant/checkout_sessions/cs_123"
      );
      const params = { params: Promise.resolve({ path: ["checkout_sessions", "cs_123"] }) };

      const response = await GET(request, params);
      expect(response.status).toBe(200);
    });
  });

  describe("Header Forwarding", () => {
    it("forwards allowed headers and injects server-side auth", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response("{}", { status: 200 })
      );

      const request = new NextRequest("http://localhost/api/proxy/merchant/checkout_sessions", {
        headers: {
          "Request-Id": "req_123",
          "Idempotency-Key": "idem_456",
          "API-Version": "2026-01-16",
          "Content-Type": "application/json",
          Accept: "application/json",
          "UCP-Agent": 'profile="https://platform.example/profile"',
          "X-A2A-Extensions": "https://ucp.dev/2026-01-23/specification/reference/",
          // These should be stripped/replaced
          Authorization: "Bearer client-key-should-be-stripped",
          "X-API-Key": "should-be-ignored",
        },
      });
      const params = { params: Promise.resolve({ path: ["checkout_sessions"] }) };

      await GET(request, params);

      const fetchCall = getFetchCall();
      const headers = fetchCall[1].headers as Headers;

      // Allowed headers should be forwarded
      expect(headers.get("Request-Id")).toBe("req_123");
      expect(headers.get("Idempotency-Key")).toBe("idem_456");
      expect(headers.get("API-Version")).toBe("2026-01-16");
      expect(headers.get("Content-Type")).toBe("application/json");
      expect(headers.get("Accept")).toBe("application/json");
      expect(headers.get("UCP-Agent")).toBe('profile="https://platform.example/profile"');
      expect(headers.get("X-A2A-Extensions")).toBe(
        "https://ucp.dev/2026-01-23/specification/reference/"
      );

      // Server-side auth should be injected
      expect(headers.get("Authorization")).toBe("Bearer test-api-key");
    });
  });

  describe("Query Parameter Preservation", () => {
    it("preserves query parameters in upstream URL", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response("{}", { status: 200 })
      );

      const request = new NextRequest(
        "http://localhost/api/proxy/merchant/products?limit=10&offset=5"
      );
      const params = { params: Promise.resolve({ path: ["products"] }) };

      await GET(request, params);

      const fetchCall = getFetchCall();
      const url = fetchCall[0] as string;

      expect(url).toContain("?limit=10&offset=5");
    });

    it("handles requests without query parameters", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response("{}", { status: 200 })
      );

      const request = new NextRequest("http://localhost/api/proxy/merchant/health");
      const params = { params: Promise.resolve({ path: ["health"] }) };

      await GET(request, params);

      const fetchCall = getFetchCall();
      const url = fetchCall[0] as string;

      expect(url).toBe("http://localhost:8000/health");
    });
  });

  describe("Request Body Handling", () => {
    it("forwards request body as ArrayBuffer for POST", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response("{}", { status: 200 })
      );

      const body = JSON.stringify({ test: "data" });
      const request = new NextRequest("http://localhost/api/proxy/merchant/checkout_sessions", {
        method: "POST",
        body: body,
        headers: { "Content-Type": "application/json" },
      });
      const params = { params: Promise.resolve({ path: ["checkout_sessions"] }) };

      await POST(request, params);

      const fetchCall = getFetchCall();
      expect(fetchCall[1].method).toBe("POST");
      expect(fetchCall[1].body).toBeInstanceOf(ArrayBuffer);
    });

    it("does not forward body for GET requests", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response("{}", { status: 200 })
      );

      const request = new NextRequest("http://localhost/api/proxy/merchant/checkout_sessions");
      const params = { params: Promise.resolve({ path: ["checkout_sessions"] }) };

      await GET(request, params);

      const fetchCall = getFetchCall();
      expect(fetchCall[1].body).toBeNull();
    });
  });

  describe("Empty Path Handling", () => {
    it("proxies to upstream root when path is empty", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response("{}", { status: 200 })
      );

      const request = new NextRequest("http://localhost/api/proxy/merchant");
      const params = { params: Promise.resolve({ path: [] }) };

      await GET(request, params);

      const fetchCall = getFetchCall();
      const url = fetchCall[0] as string;

      // Empty path should proxy to root
      expect(url).toBe("http://localhost:8000/");
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
      const upstreamBody = JSON.stringify({ id: "cs_123", status: "created" });
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(upstreamBody, {
          status: 201,
          statusText: "Created",
          headers: { "Content-Type": "application/json" },
        })
      );

      const request = new NextRequest("http://localhost/api/proxy/merchant/checkout_sessions", {
        method: "POST",
        body: "{}",
        headers: { "Content-Type": "application/json" },
      });
      const params = { params: Promise.resolve({ path: ["checkout_sessions"] }) };

      const response = await POST(request, params);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.id).toBe("cs_123");
    });

    it("forwards upstream error responses", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
        new Response(JSON.stringify({ error: "Not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      );

      const request = new NextRequest(
        "http://localhost/api/proxy/merchant/checkout_sessions/invalid"
      );
      const params = { params: Promise.resolve({ path: ["checkout_sessions", "invalid"] }) };

      const response = await GET(request, params);

      expect(response.status).toBe(404);
    });
  });

  describe("Error Handling", () => {
    it("returns 502 on fetch error", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Connection refused"));

      const request = new NextRequest("http://localhost/api/proxy/merchant/health");
      const params = { params: Promise.resolve({ path: ["health"] }) };

      const response = await GET(request, params);

      expect(response.status).toBe(502);
      const data = await response.json();
      expect(data.error).toBe("Upstream request failed");
    });
  });
});
