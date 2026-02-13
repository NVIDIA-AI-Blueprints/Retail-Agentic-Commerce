/* eslint-disable no-console */

/**
 * Merchant API Proxy Route
 *
 * Proxies requests to the Merchant API with server-side authentication.
 * This keeps API keys secure on the server, never exposing them to the browser.
 *
 * Security features:
 * - SSRF protection via path segment validation
 * - Server-side API key injection
 * - Fail-fast validation when API key is missing
 * - Safe header forwarding
 */

import { NextRequest, NextResponse } from "next/server";

// Force Node.js runtime (not Edge) for full API compatibility
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MERCHANT_API_URL = process.env.MERCHANT_API_URL || "http://localhost:8000";
const MERCHANT_API_KEY = process.env.MERCHANT_API_KEY;

// Fail-fast: log warning on module load if API key is missing
// (actual error returned on first request)
if (!MERCHANT_API_KEY) {
  console.warn("[MerchantProxy] MERCHANT_API_KEY not configured - requests will fail");
}

// Headers to forward from client to upstream
const FORWARD_HEADERS = [
  "request-id",
  "idempotency-key",
  "api-version",
  "content-type",
  "accept",
  "ucp-agent",
  "x-a2a-extensions",
];

/**
 * Validate path segments to prevent SSRF/open proxy attacks.
 * Rejects paths containing:
 * - ".." (path traversal)
 * - ":" (protocol injection like http:)
 * - Segments starting with "//" (protocol-relative URLs)
 */
function validatePathSegments(segments: string[]): boolean {
  for (const segment of segments) {
    if (segment.includes("..") || segment.includes(":") || segment.startsWith("//")) {
      return false;
    }
  }
  return true;
}

/**
 * Build safe upstream URL from validated path segments.
 * Preserves any base path prefix in the MERCHANT_API_URL.
 */
function buildUpstreamUrl(baseUrl: string, segments: string[], searchParams: string): URL {
  const url = new URL(baseUrl);
  // Preserve base path from baseUrl, then append segments
  const basePath = url.pathname.replace(/\/+$/, ""); // Remove trailing slashes
  const segmentPath = segments.length > 0 ? "/" + segments.map(encodeURIComponent).join("/") : "";
  url.pathname = basePath + segmentPath;
  // Preserve query string from original request
  url.search = searchParams;
  return url;
}

/**
 * Forward headers from client request, filtering blocked ones.
 */
function buildUpstreamHeaders(request: NextRequest): Headers {
  const headers = new Headers();

  // Forward allowed headers
  for (const name of FORWARD_HEADERS) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  // Inject server-side auth
  headers.set("Authorization", `Bearer ${MERCHANT_API_KEY}`);

  return headers;
}

/**
 * Generic proxy handler for GET, POST, PUT, PATCH, DELETE
 */
async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  // Fail-fast: return 500 if API key is not configured
  if (!MERCHANT_API_KEY) {
    console.error("[MerchantProxy] MERCHANT_API_KEY is not configured");
    return NextResponse.json(
      { error: "Proxy misconfigured: MERCHANT_API_KEY not set" },
      { status: 500 }
    );
  }

  const { path: pathSegments = [] } = await params;

  // SSRF protection: validate path segments
  if (!validatePathSegments(pathSegments)) {
    console.error("[MerchantProxy] Invalid path segments:", pathSegments);
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const upstreamUrl = buildUpstreamUrl(MERCHANT_API_URL, pathSegments, request.nextUrl.search);

  const upstreamHeaders = buildUpstreamHeaders(request);

  // Forward request body for methods that have one
  let body: ArrayBuffer | null = null;
  if (!["GET", "HEAD"].includes(request.method)) {
    body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(upstreamUrl.toString(), {
      method: request.method,
      headers: upstreamHeaders,
      body: body,
    });

    // Forward response with status and headers
    const responseBody = await response.arrayBuffer();
    const responseHeaders = new Headers();

    // Forward safe response headers
    for (const [key, value] of response.headers.entries()) {
      // Skip hop-by-hop headers
      if (!["transfer-encoding", "connection", "keep-alive"].includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    }

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[MerchantProxy] Fetch error:", error);
    return NextResponse.json({ error: "Upstream request failed" }, { status: 502 });
  }
}

/**
 * OPTIONS handler - return 204 locally without proxying upstream.
 * Avoids leaking upstream CORS configuration.
 */
async function handleOptions(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204 });
}

// Export handlers for each method
export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = handleOptions;
