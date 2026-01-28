"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useACPLog } from "@/hooks/useACPLog";
import { useMCPClient } from "@/hooks/useMCPClient";

/**
 * Props for the MerchantIframeContainer component
 */
interface MerchantIframeContainerProps {
  /** Callback when checkout is completed */
  onCheckoutComplete?: (orderId: string) => void;
}

/**
 * Fallback URL for development when MCP server is not running.
 * Uses the Vite dev server directly (port may vary if 3001 is in use).
 */
const VITE_DEV_URL = "http://localhost:3002";

/**
 * Loading animation delay in milliseconds.
 * Shows the skeleton loader for this duration before revealing the iframe.
 */
const LOADING_DELAY_MS = 4000;

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
export function MerchantIframeContainer({ onCheckoutComplete }: MerchantIframeContainerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mcpCalledRef = useRef(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [mcpStatus, setMcpStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [discoveredWidgetUri, setDiscoveredWidgetUri] = useState<string | null>(null);

  // ACP logging for protocol inspector - extract stable functions only
  const { logEvent, completeEvent } = useACPLog();

  // MCP client hook for URL discovery - extract stable function only
  const { getWidgetUrl } = useMCPClient();

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
  const initializeMCPWidget = useCallback(async () => {
    if (mcpCalledRef.current) return;
    mcpCalledRef.current = true;

    setMcpStatus("loading");

    // Log MCP tool call - we're calling an actual tool, not just checking health
    const eventId = logEvent(
      "session_create",
      "POST",
      "/api/mcp (tools/call: search-products)",
      "Calling MCP tool to discover widget URI"
    );

    try {
      // Call MCP tool - widget URL is DISCOVERED from response, not hardcoded
      const { widgetUrl, widgetUri, error } = await getWidgetUrl();

      if (error) {
        throw new Error(error);
      }

      if (widgetUrl && widgetUri) {
        // Successfully discovered widget URL from MCP tool response
        // Include both the discovery and resolution in the completion message
        completeEvent(eventId, "success", `Discovered: ${widgetUri}`, 200);

        setDiscoveredWidgetUri(widgetUri);
        setIframeSrc(widgetUrl);
        setMcpStatus("success");
      } else {
        throw new Error("MCP tool did not return widget URI in _meta");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "MCP tool call failed";

      // Complete the original event with error, include fallback info in the message
      completeEvent(eventId, "error", `${errorMessage} → Fallback: ${VITE_DEV_URL}`, 500);

      setIframeSrc(VITE_DEV_URL);
      setMcpStatus("error");
    }
  }, [logEvent, completeEvent, getWidgetUrl]);

  /**
   * Initialize MCP widget on component mount
   */
  useEffect(() => {
    initializeMCPWidget();
  }, [initializeMCPWidget]);

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
  }, [logEvent, completeEvent, isAnimationComplete]);

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
    if (iframeSrc && iframeSrc !== VITE_DEV_URL) {
      setIframeSrc(VITE_DEV_URL);
    }
  }, [iframeSrc]);

  /**
   * Handle messages from the iframe.
   * The widget is self-contained - we only listen for completion notifications.
   */
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const message = event.data;

      if (typeof message !== "object" || message === null) return;

      // Listen for checkout completion notification from the widget
      if (message.type === "CHECKOUT_COMPLETE" && message.orderId) {
        const eventId = logEvent(
          "session_update",
          "POST",
          "/checkout_sessions/complete",
          "Processing checkout..."
        );
        completeEvent(eventId, "success", `Order completed: ${message.orderId}`, 200);

        if (onCheckoutComplete) {
          onCheckoutComplete(message.orderId as string);
        }
      }
    },
    [logEvent, completeEvent, onCheckoutComplete]
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

  return (
    <div className="merchant-iframe-container">
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
      {!isIframeLoaded && (
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
            <span>Loading...</span>
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
            opacity: isIframeLoaded ? 1 : 0,
            transform: isIframeLoaded ? "scale(1)" : "scale(0.995)",
            filter: isIframeLoaded ? "none" : "saturate(0.98)",
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
          background: transparent;
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
          background: linear-gradient(to bottom, rgba(26, 26, 26, 0.95), rgba(26, 26, 26, 0.88));
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
