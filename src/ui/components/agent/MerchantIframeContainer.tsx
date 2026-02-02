"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useACPLog } from "@/hooks/useACPLog";
import { useMCPClient } from "@/hooks/useMCPClient";
import { useAgentActivityLog } from "@/hooks/useAgentActivityLog";
import type { RecommendationInputSignals, RecommendationDecision } from "@/types";

/**
 * Props for the MerchantIframeContainer component
 */
interface MerchantIframeContainerProps {
  /** Callback when checkout is completed */
  onCheckoutComplete?: (orderId: string) => void;
  /** Trigger a search request in the widget */
  searchRequest?: { query: string; requestId: number } | null;
}

/**
 * MCP Server base URL - uses nginx proxy in Docker, direct in development
 */
const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || "http://localhost:2091";

/**
 * Fallback URL when MCP tool discovery fails.
 * In Docker: uses nginx-proxied Apps SDK widget
 * In dev: uses Vite dev server directly
 */
const FALLBACK_WIDGET_URL =
  MCP_SERVER_URL === "/apps-sdk"
    ? "/apps-sdk/widget/merchant-app.html" // Docker via nginx
    : "http://localhost:3001"; // Local Vite dev server

/**
 * Loading animation delay in milliseconds.
 * Shows the skeleton loader for this duration before revealing the iframe.
 */
const LOADING_DELAY_MS = 4000;

/**
 * Minimum delay for recommendation requests in milliseconds.
 * Ensures the skeleton loader is visible for at least this duration.
 */
const MIN_RECOMMENDATION_DELAY_MS = 1000;

/**
 * Minimum delay for search refresh loading animation in milliseconds.
 */
const MIN_SEARCH_DELAY_MS = 800;

/**
 * MerchantIframeContainer Component
 *
 * Embeds the merchant widget within the Client Agent panel.
 * The container has NO knowledge of the widget's internal state or data.
 * The widget is fully self-contained and manages its own:
 * - Product recommendations (via MCP tools)
 * - User context
 * - Cart state
 * - Checkout flow
 *
 * Flow:
 * 1. Calls MCP server's search-products tool to discover widget URI
 * 2. Extracts widget URI from _meta.openai/outputTemplate
 * 3. Resolves ui://widget/... to HTTP URL
 * 4. Loads the widget in an iframe
 * 5. Listens for checkout completion events (optional)
 *
 * Features:
 * - Proper MCP protocol integration for URL discovery
 * - Shows skeleton loading animation
 * - Logs Apps SDK events to the Protocol Inspector
 * - No data injection - widget is self-contained
 */
export function MerchantIframeContainer({
  onCheckoutComplete,
  searchRequest,
}: MerchantIframeContainerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mcpCalledRef = useRef(false);
  const bridgeInitializedRef = useRef(false);
  const lastSearchRequestIdRef = useRef<number | null>(null);
  const searchLoadingTokenRef = useRef(0);
  const latestGlobalsRef = useRef<Record<string, unknown> | null>(null);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [mcpStatus, setMcpStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [discoveredWidgetUri, setDiscoveredWidgetUri] = useState<string | null>(null);
  const shouldRevealIframe = isIframeLoaded && !isSearchLoading;

  // ACP logging for protocol inspector - extract stable functions only
  const { logEvent, completeEvent } = useACPLog();

  // MCP client hook for URL discovery and tool calls
  const { getWidgetUrl, callTool, callToolWithWidget } = useMCPClient();

  // Agent activity logging for recommendation events
  const { logAgentCall, completeAgentCall } = useAgentActivityLog();

  /**
   * Initialize widget by calling MCP tool to discover widget URI.
   * The client has NO knowledge of the widget URL until the MCP tool responds.
   *
   * Flow:
   * 1. Call MCP tool (search-products)
   * 2. Extract widget URI from _meta.openai/outputTemplate
   * 3. Resolve URI to HTTP URL
   * 4. Load in iframe
   */
  const postGlobalsToIframe = useCallback((globals: Record<string, unknown>, type: string) => {
    if (!iframeRef.current?.contentWindow) {
      return;
    }
    iframeRef.current.contentWindow.postMessage(
      {
        type,
        globals,
      },
      "*"
    );
  }, []);

  const initializeMCPWidget = useCallback(
    async (query: string) => {
      if (mcpCalledRef.current) return;
      mcpCalledRef.current = true;

      setMcpStatus("loading");

      const trimmedQuery = query.trim();
      const searchEventId = logAgentCall("search", {
        query: trimmedQuery,
        limit: 3,
      });
      const searchLoadingToken = Date.now();
      searchLoadingTokenRef.current = searchLoadingToken;
      setIsSearchLoading(true);

      // Log MCP tool call - we're calling an actual tool, not just checking health
      const eventId = logEvent(
        "session_create",
        "POST",
        "/api/mcp (tools/call: search-products)",
        "Calling MCP tool to discover widget URI"
      );

      try {
        // Call MCP tool - widget URL is DISCOVERED from response, not hardcoded
        const { widgetUrl, widgetUri, error, result } = await getWidgetUrl(query, 3);
        const toolError =
          error ?? (typeof result?.error === "string" ? (result.error as string) : null);

        if (widgetUrl && widgetUri) {
          // Successfully discovered widget URL from MCP tool response
          // Include both the discovery and resolution in the completion message
          if (toolError) {
            completeEvent(eventId, "error", toolError, 500);
          } else {
            completeEvent(eventId, "success", `Discovered: ${widgetUri}`, 200);
          }

          setDiscoveredWidgetUri(widgetUri);
          setIframeSrc(widgetUrl);
          setMcpStatus("success");

          const toolOutput = result ?? (toolError ? { error: toolError, products: [] } : null);

          if (toolError) {
            completeAgentCall(searchEventId, "error", undefined, toolError);
          } else if (toolOutput) {
            const productCount = Array.isArray(toolOutput.products)
              ? toolOutput.products.length
              : 0;
            const decision = {
              results: Array.isArray(toolOutput.products)
                ? toolOutput.products.map((product: { id?: string; name?: string }) => ({
                    productId: product.id ?? "",
                    productName: product.name ?? "Product",
                  }))
                : [],
              totalResults:
                typeof toolOutput.totalResults === "number"
                  ? toolOutput.totalResults
                  : productCount,
            };
            completeAgentCall(searchEventId, "success", decision);
          }

          if (toolOutput) {
            latestGlobalsRef.current = {
              toolInput: { query, limit: 3 },
              toolOutput: toolOutput,
            };
          }
        } else {
          throw new Error(toolError ?? "MCP tool did not return widget URI in _meta");
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "MCP tool call failed";

        // Complete the original event with error, include fallback info in the message
        completeEvent(eventId, "error", `${errorMessage} → Fallback: ${FALLBACK_WIDGET_URL}`, 500);
        completeAgentCall(searchEventId, "error", undefined, errorMessage);

        setIframeSrc(FALLBACK_WIDGET_URL);
        setMcpStatus("error");
      } finally {
        const elapsed = Date.now() - searchLoadingToken;
        const remaining = MIN_SEARCH_DELAY_MS - elapsed;
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }
        if (searchLoadingTokenRef.current === searchLoadingToken) {
          setIsSearchLoading(false);
        }
      }
    },
    [logAgentCall, completeAgentCall, logEvent, completeEvent, getWidgetUrl]
  );

  /**
   * Handle iframe load event.
   * The widget is self-contained - we don't inject any data.
   */
  const handleIframeLoad = useCallback(() => {
    // Log the widget loaded event and immediately complete it
    const eventId = logEvent("session_create", "GET", "/apps-sdk/init", "Widget loading...");
    completeEvent(eventId, "success", "Apps SDK widget loaded", 200);

    // If animation already completed, show iframe immediately
    if (isAnimationComplete) {
      setIsIframeLoaded(true);
    }

    if (!bridgeInitializedRef.current && latestGlobalsRef.current) {
      postGlobalsToIframe(latestGlobalsRef.current, "UPDATE_OPENAI_GLOBALS");
      bridgeInitializedRef.current = true;
    }
  }, [logEvent, completeEvent, isAnimationComplete, postGlobalsToIframe]);

  /**
   * Start the loading animation timer when component mounts
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimationComplete(true);
      // Always reveal the iframe after the delay
      setIsIframeLoaded(true);
    }, LOADING_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Handle iframe error - fallback to Vite dev server
   */
  const handleIframeError = useCallback(() => {
    if (iframeSrc && iframeSrc !== FALLBACK_WIDGET_URL) {
      setIframeSrc(FALLBACK_WIDGET_URL);
    }
  }, [iframeSrc]);

  /**
   * Handle GET_RECOMMENDATIONS request from iframe.
   * Calls the MCP tool and logs to Agent Activity panel.
   * Ensures a minimum delay for UX (skeleton visibility).
   */
  const handleRecommendationRequest = useCallback(
    async (data: {
      productId: string;
      productName: string;
      cartItems: Array<{ productId: string; name: string; price: number }>;
      source?: string;
    }) => {
      const source = data.source || "product_detail";
      // Record start time for minimum delay calculation
      const startTime = Date.now();

      // Create input signals for agent activity logging
      const inputSignals: RecommendationInputSignals = {
        productId: data.productId,
        productName: data.productName,
        cartItems: data.cartItems,
      };

      // Log the start of the recommendation request
      const agentEventId = logAgentCall("recommendation", inputSignals);

      // Log to ACP protocol inspector
      const contextLabel = source === "checkout" ? "cart checkout" : data.productName;
      const acpEventId = logEvent(
        "session_update",
        "POST",
        "/api/mcp (tools/call: get-recommendations)",
        `Getting recommendations for ${contextLabel}...`
      );

      /**
       * Helper to ensure minimum delay before sending result.
       * This ensures the skeleton loader is visible for at least MIN_RECOMMENDATION_DELAY_MS.
       */
      const waitForMinDelay = async () => {
        const elapsed = Date.now() - startTime;
        const remaining = MIN_RECOMMENDATION_DELAY_MS - elapsed;
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }
      };

      try {
        // Call the MCP tool
        const result = await callTool("get-recommendations", {
          productId: data.productId,
          productName: data.productName,
          cartItems: data.cartItems,
        });

        // Parse the result - ensure recommendations is an array
        const rawRecommendations = Array.isArray(result?.recommendations)
          ? result.recommendations
          : [];
        const userIntent = typeof result?.userIntent === "string" ? result.userIntent : undefined;
        const rawPipelineTrace = result?.pipelineTrace as
          | {
              candidatesFound?: number;
              afterNliFilter?: number;
              finalRanked?: number;
            }
          | undefined;

        // Map recommendations to typed format
        type RawRec = {
          productId?: string;
          product_id?: string;
          productName?: string;
          product_name?: string;
          rank: number;
          reasoning: string;
        };
        const mappedRecommendations = rawRecommendations.map((rec: RawRec) => ({
          productId: rec.productId ?? rec.product_id ?? "",
          productName: rec.productName ?? rec.product_name ?? "",
          rank: rec.rank,
          reasoning: rec.reasoning,
        }));

        // Create decision for agent activity log
        const decision: RecommendationDecision = {
          recommendations: mappedRecommendations,
          ...(userIntent !== undefined && { userIntent }),
          ...(rawPipelineTrace && {
            pipelineTrace: {
              candidatesFound: rawPipelineTrace.candidatesFound ?? 0,
              afterNliFilter: rawPipelineTrace.afterNliFilter ?? 0,
              finalRanked: rawPipelineTrace.finalRanked ?? 0,
            },
          }),
        };

        // Complete agent activity log
        completeAgentCall(agentEventId, "success", decision);

        // Complete ACP log
        completeEvent(
          acpEventId,
          "success",
          `Found ${rawRecommendations.length} recommendations`,
          200
        );

        // Ensure minimum delay for UX before sending result
        await waitForMinDelay();

        // Send result back to iframe with source for routing
        const messageToSend = {
          type: "RECOMMENDATIONS_RESULT",
          source,
          recommendations: rawRecommendations,
          userIntent,
          pipelineTrace: rawPipelineTrace,
        };
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(messageToSend, "*");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to get recommendations";

        // Complete agent activity log with error
        completeAgentCall(agentEventId, "error", undefined, errorMessage);

        // Complete ACP log with error
        completeEvent(acpEventId, "error", errorMessage, 500);

        // Ensure minimum delay for UX before sending error
        await waitForMinDelay();

        // Send error back to iframe with source for routing
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "RECOMMENDATIONS_RESULT",
            source,
            recommendations: [],
            error: errorMessage,
          },
          "*"
        );
      }
    },
    [logAgentCall, completeAgentCall, logEvent, completeEvent, callTool]
  );

  /**
   * Handle messages from the iframe.
   * Handles checkout completion and recommendation requests.
   */
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const message = event.data;

      if (typeof message !== "object" || message === null) return;

      // Handle recommendation request from widget
      if (message.type === "GET_RECOMMENDATIONS") {
        const requestData: {
          productId: string;
          productName: string;
          cartItems: Array<{ productId: string; name: string; price: number }>;
          source?: string;
        } = {
          productId: message.productId as string,
          productName: message.productName as string,
          cartItems:
            (message.cartItems as Array<{ productId: string; name: string; price: number }>) ?? [],
        };
        if (message.source) {
          requestData.source = message.source as string;
        }
        handleRecommendationRequest(requestData);
        return;
      }

      // Listen for checkout completion notification from the widget (optional)
      // Note: The widget is isolated and doesn't send postMessage for checkout events.
      // Instead, the Protocol Inspector subscribes to SSE events from the MCP server.
      if (message.type === "CHECKOUT_COMPLETE" && message.orderId) {
        if (onCheckoutComplete) {
          onCheckoutComplete(message.orderId as string);
        }
      }
    },
    [onCheckoutComplete, handleRecommendationRequest]
  );

  /**
   * Set up message listener for checkout completion notifications
   */
  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handleMessage]);

  const handleSearchRequest = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;

      const searchLoadingToken = Date.now();
      searchLoadingTokenRef.current = searchLoadingToken;
      setIsSearchLoading(true);

      const searchEventId = logAgentCall("search", {
        query: trimmedQuery,
        limit: 3,
      });

      const acpEventId = logEvent(
        "session_update",
        "POST",
        "/api/mcp (tools/call: search-products)",
        `Searching for "${trimmedQuery}"...`
      );

      try {
        const { result, error } = await callToolWithWidget("search-products", {
          query: trimmedQuery,
          limit: 3,
        });

        const toolError =
          error ?? (typeof result?.error === "string" ? (result.error as string) : null);
        const toolOutput = result ?? (toolError ? { error: toolError, products: [] } : null);

        if (toolOutput) {
          const productCount = Array.isArray(toolOutput.products) ? toolOutput.products.length : 0;
          const globals = {
            toolInput: { query: trimmedQuery, limit: 3 },
            toolOutput: toolOutput,
          };
          latestGlobalsRef.current = globals;
          if (bridgeInitializedRef.current) {
            postGlobalsToIframe(globals, "UPDATE_OPENAI_GLOBALS");
          } else {
            postGlobalsToIframe(globals, "UPDATE_OPENAI_GLOBALS");
            bridgeInitializedRef.current = true;
          }

          if (toolError) {
            completeEvent(acpEventId, "error", toolError, 500);
            completeAgentCall(searchEventId, "error", undefined, toolError);
          } else {
            completeEvent(acpEventId, "success", `Found ${productCount} products`, 200);
            const decision = {
              results: Array.isArray(toolOutput.products)
                ? toolOutput.products.map((product: { id?: string; name?: string }) => ({
                    productId: product.id ?? "",
                    productName: product.name ?? "Product",
                  }))
                : [],
              totalResults:
                typeof toolOutput.totalResults === "number"
                  ? toolOutput.totalResults
                  : productCount,
            };
            completeAgentCall(searchEventId, "success", decision);
          }
        } else if (toolError) {
          throw new Error(toolError);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to search products";
        completeEvent(acpEventId, "error", errorMessage, 500);
        completeAgentCall(searchEventId, "error", undefined, errorMessage);
      } finally {
        const elapsed = Date.now() - searchLoadingToken;
        const remaining = MIN_SEARCH_DELAY_MS - elapsed;
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }
        if (searchLoadingTokenRef.current === searchLoadingToken) {
          setIsSearchLoading(false);
        }
      }
    },
    [
      callToolWithWidget,
      logAgentCall,
      completeAgentCall,
      logEvent,
      completeEvent,
      postGlobalsToIframe,
    ]
  );

  useEffect(() => {
    if (!searchRequest?.query) return;
    if (searchRequest.requestId === lastSearchRequestIdRef.current) return;
    lastSearchRequestIdRef.current = searchRequest.requestId;

    if (!mcpCalledRef.current) {
      initializeMCPWidget(searchRequest.query);
      return;
    }

    handleSearchRequest(searchRequest.query);
  }, [searchRequest?.requestId, searchRequest?.query, initializeMCPWidget, handleSearchRequest]);

  return (
    <div className={`merchant-iframe-container${isSearchLoading ? " is-search-loading" : ""}`}>
      {/* MCP Status indicator */}
      {mcpStatus === "loading" && (
        <div className="mcp-status">
          <span className="mcp-dot loading" />
          <span>POST /api/mcp tools/call search-products...</span>
        </div>
      )}
      {mcpStatus === "success" && discoveredWidgetUri && (
        <div className="mcp-status success">
          <span className="mcp-dot success" />
          <span>Discovered: {discoveredWidgetUri}</span>
        </div>
      )}
      {mcpStatus === "error" && (
        <div className="mcp-status error">
          <span className="mcp-dot error" />
          <span>MCP tool call failed - using fallback</span>
        </div>
      )}

      {/* Skeleton loader overlay - only render when not loaded */}
      {(!isIframeLoaded || isSearchLoading) && (
        <div className="loader">
          <div className="topbar">
            <div className="pill shimmer"></div>
            <div className="pill right shimmer"></div>
          </div>

          <div className="body">
            <div className="skeleton-grid">
              <div className="row w60 shimmer"></div>
              <div className="row w80 shimmer"></div>
              <div className="row w40 shimmer"></div>

              <div className="card-row">
                <div className="card shimmer"></div>
                <div className="card shimmer"></div>
                <div className="card shimmer"></div>
              </div>

              <div className="row w80 shimmer" style={{ marginTop: "10px" }}></div>
              <div className="row w60 shimmer"></div>
            </div>
          </div>

          <div className="hint">
            <span className="dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </span>
            <span>{isSearchLoading ? "Refreshing results..." : "Loading..."}</span>
          </div>
        </div>
      )}

      {/* Merchant widget iframe - only render when we have a URL */}
      {iframeSrc && (
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          title="Merchant Widget"
          style={{
            opacity: shouldRevealIframe ? 1 : 0,
            transform: shouldRevealIframe ? "scale(1)" : "scale(0.995)",
            filter: shouldRevealIframe ? "none" : "saturate(0.98)",
            visibility: shouldRevealIframe ? "visible" : "hidden",
            pointerEvents: shouldRevealIframe ? "auto" : "none",
          }}
          className="merchant-iframe"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-scripts allow-same-origin allow-forms"
          allow="payment"
        />
      )}

      <style jsx>{`
        .merchant-iframe-container {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-radius: 0 0 var(--glass-radius-sm, 14px) var(--glass-radius-sm, 14px);
          background: #1a1a1a;
        }

        /* MCP Status indicator */
        .mcp-status {
          position: absolute;
          top: 8px;
          left: 8px;
          right: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          z-index: 15;
          animation: fadeIn 0.3s ease;
        }

        .mcp-status.success {
          background: rgba(118, 185, 0, 0.15);
          color: #76b900;
          animation: fadeOut 2s ease forwards;
          animation-delay: 1s;
        }

        .mcp-status.error {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .mcp-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
        }

        .mcp-dot.loading {
          animation: pulse 1s ease-in-out infinite;
        }

        .mcp-dot.success {
          background: #76b900;
        }

        .mcp-dot.error {
          background: #ef4444;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
            visibility: hidden;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }

        /* Iframe styling with smooth reveal */
        .merchant-iframe {
          flex: 1;
          width: 100%;
          border: none;
          background: #1a1a1a;
          transition:
            opacity 220ms ease,
            transform 220ms ease,
            filter 220ms ease;
        }

        /* Loader overlay with breathing animation */
        .loader {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-rows: auto 1fr;
          padding: 18px;
          padding-top: 48px; /* Space for MCP status */
          gap: 14px;
          pointer-events: none;
          opacity: 1;
          transition: opacity 200ms ease;
          background: linear-gradient(to bottom, rgba(26, 26, 26, 0.98), rgba(26, 26, 26, 0.96));
          animation: breathe 1.6s ease-in-out infinite;
          z-index: 10;
        }

        /* Top header skeleton row */
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .pill {
          height: 12px;
          width: 140px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          position: relative;
          overflow: hidden;
        }

        .pill.right {
          width: 92px;
        }

        /* Main skeleton body */
        .body {
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.02);
          overflow: hidden;
          position: relative;
        }

        .skeleton-grid {
          padding: 18px;
          display: grid;
          gap: 14px;
        }

        .row {
          height: 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          overflow: hidden;
          position: relative;
        }

        .row.w60 {
          width: 60%;
        }
        .row.w80 {
          width: 80%;
        }
        .row.w40 {
          width: 40%;
        }

        .card-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 6px;
        }

        .card {
          height: 86px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.08);
          position: relative;
          overflow: hidden;
        }

        /* Shimmer effect */
        .shimmer::before {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-120%);
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.08) 45%,
            transparent 90%
          );
          animation: shimmer 1.2s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(120%);
          }
        }

        @keyframes breathe {
          0%,
          100% {
            opacity: 0.95;
          }
          50% {
            opacity: 0.78;
          }
        }

        /* Loading hint with animated dots */
        .hint {
          position: absolute;
          left: 18px;
          bottom: 14px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dots {
          display: inline-flex;
          gap: 6px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.25);
          animation: dots 900ms ease-in-out infinite;
        }

        .dot:nth-child(2) {
          animation-delay: 120ms;
        }

        .dot:nth-child(3) {
          animation-delay: 240ms;
        }

        @keyframes dots {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0.35;
          }
          50% {
            transform: translateY(-2px);
            opacity: 0.85;
          }
        }

        /* Reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .loader,
          .shimmer::before,
          .dot {
            animation: none !important;
          }
          .merchant-iframe {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
