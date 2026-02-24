import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";
import { applyDocumentTheme } from "@openai/apps-sdk-ui/theme";
import type { OpenAiGlobals, ToolOutput } from "./types";

// Initialize theme from localStorage or system preference before React renders
const THEME_STORAGE_KEY = "acp-widget-theme";
const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as "light" | "dark" | null;
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyDocumentTheme(savedTheme ?? (systemPrefersDark ? "dark" : "light"));

// Store for simulated bridge data
let simulatedToolOutput: ToolOutput | null = null;

// Persisted widget state in simulated mode (stored in memory)
let simulatedWidgetState: unknown = null;

/**
 * Determine the MCP server base URL for the simulated bridge.
 * Uses the same 3-way detection as the rest of the widget:
 * 1. Vite dev server → localhost:2091
 * 2. Nginx proxy (/apps-sdk/) → /apps-sdk
 * 3. Direct → ""
 */
function getMcpBaseUrl(): string {
  const isViteDevServer = window.location.port === "3001" || window.location.port === "3002";
  const isAppsSdkPath = window.location.pathname.startsWith("/apps-sdk/");

  if (isViteDevServer) {
    return "http://localhost:2091";
  } else if (isAppsSdkPath) {
    return "/apps-sdk";
  } else {
    return "";
  }
}

interface McpJsonRpcResponse {
  result?: {
    structuredContent?: Record<string, unknown>;
    content?: Array<{ type: string; text: string }>;
    isError?: boolean;
  };
  error?: { code: number; message: string };
}

/**
 * Parse the raw response text (SSE stream or plain JSON) into a JSON-RPC response.
 */
function parseMcpResponse(text: string): McpJsonRpcResponse | null {
  // Try SSE stream first — look for "data: " lines containing a JSON-RPC result
  for (const line of text.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    try {
      const data = JSON.parse(line.slice(6)) as McpJsonRpcResponse;
      if (data.result || data.error) return data;
    } catch {
      // Continue parsing remaining lines
    }
  }
  // Fallback to plain JSON
  try {
    return JSON.parse(text) as McpJsonRpcResponse;
  } catch {
    return null;
  }
}

/**
 * Extract the tool result string from a parsed MCP JSON-RPC response.
 */
function extractToolResult(mcpResponse: McpJsonRpcResponse): string {
  const structured = mcpResponse.result?.structuredContent;
  if (structured) return JSON.stringify(structured);
  const textContent = mcpResponse.result?.content?.[0]?.text;
  return textContent ?? JSON.stringify({ success: false, error: "Empty response" });
}

/**
 * Call an MCP tool directly via JSON-RPC to the MCP server.
 * Parses the SSE response stream to extract the tool result.
 * This is used by the simulated bridge in dev mode.
 */
async function callMcpTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ result: string }> {
  const mcpBaseUrl = getMcpBaseUrl();
  const response = await fetch(`${mcpBaseUrl}/api/mcp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: { name, arguments: args },
    }),
    signal: AbortSignal.timeout(65000),
  });

  if (!response.ok) {
    throw new Error(`MCP server returned ${response.status}: ${response.statusText || "Unknown error"}`);
  }

  const text = await response.text();
  const mcpResponse = parseMcpResponse(text);

  if (!mcpResponse) {
    throw new Error("No valid response from MCP server");
  }
  if (mcpResponse.error) {
    throw new Error(`MCP error: ${mcpResponse.error.message}`);
  }

  return { result: extractToolResult(mcpResponse) };
}

/**
 * Create a simulated window.openai object for standalone mode.
 * This mimics what the client agent injects in production.
 * callTool sends JSON-RPC directly to the MCP server (like the real host does).
 */
function createSimulatedOpenAi(globals?: Partial<OpenAiGlobals>): OpenAiGlobals {
  return {
    theme: globals?.theme ?? "dark",
    locale: globals?.locale ?? "en-US",
    maxHeight: globals?.maxHeight ?? 600,
    displayMode: globals?.displayMode ?? "inline",
    toolInput: globals?.toolInput ?? {},
    toolOutput: globals?.toolOutput ?? simulatedToolOutput,
    widgetState: globals?.widgetState ?? (simulatedWidgetState as OpenAiGlobals["widgetState"]),

    // Persist widget state in memory for simulated mode
    setWidgetState: async (state: unknown) => {
      console.log("[SimulatedBridge] setWidgetState:", state);
      simulatedWidgetState = state;
    },

    // Direct MCP JSON-RPC call (no postMessage relay)
    callTool: async (name: string, args: Record<string, unknown>) => {
      console.log("[SimulatedBridge] callTool:", name, args);
      try {
        return await callMcpTool(name, args);
      } catch (error) {
        console.error("[SimulatedBridge] callTool failed:", error);
        const msg = error instanceof Error ? error.message : "callTool failed";
        return { result: JSON.stringify({ success: false, error: msg }) };
      }
    },

    sendFollowUpMessage: async (args: { prompt: string }) => {
      console.log("[SimulatedBridge] sendFollowUpMessage:", args);
    },

    openExternal: (payload: { href: string }) => {
      window.open(payload.href, "_blank");
    },

    requestDisplayMode: async (args: { mode: "pip" | "inline" | "fullscreen" }) => {
      console.log("[SimulatedBridge] requestDisplayMode:", args);
      return { mode: args.mode };
    },

    requestModal: async (args: { title?: string; template?: string; params?: unknown }) => {
      console.log("[SimulatedBridge] requestModal:", args);
      return {};
    },

    requestClose: async () => {
      console.log("[SimulatedBridge] requestClose");
    },
  };
}

/**
 * Set up the simulated bridge from parent messages
 */
function setupBridgeFromParent(): Promise<void> {
  return new Promise((resolve) => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "INIT_OPENAI_BRIDGE") {
        const globals = event.data.globals as Partial<OpenAiGlobals> | undefined;
        
        // Store tool output for later
        if (globals?.toolOutput) {
          simulatedToolOutput = globals.toolOutput;
        }
        
        // Create and inject the simulated bridge
        window.openai = createSimulatedOpenAi(globals);
        
        // Dispatch event for React hooks to pick up
        window.dispatchEvent(
          new CustomEvent("openai:set_globals", {
            detail: { globals: window.openai },
          })
        );
        
        console.log("[SimulatedBridge] Bridge initialized from parent");
        window.removeEventListener("message", handleMessage);
        resolve();
      }
    };
    
    window.addEventListener("message", handleMessage);
    
    // Timeout - create default bridge if parent doesn't send init
    setTimeout(() => {
      if (!window.openai) {
        window.openai = createSimulatedOpenAi();
        console.log("[SimulatedBridge] Bridge initialized with defaults (timeout)");
      }
      window.removeEventListener("message", handleMessage);
      resolve();
    }, 2000);
  });
}

function applyGlobalsUpdate(globals?: Partial<OpenAiGlobals>) {
  if (!globals) return;

  if (globals.toolOutput) {
    simulatedToolOutput = globals.toolOutput as ToolOutput;
  }

  if (!window.openai) {
    window.openai = createSimulatedOpenAi(globals);
  } else {
    window.openai = { ...window.openai, ...globals };
  }

  window.dispatchEvent(
    new CustomEvent("openai:set_globals", {
      detail: { globals: window.openai },
    })
  );
}

function setupUpdateListener() {
  window.addEventListener("message", (event: MessageEvent) => {
    if (
      event.data?.type === "UPDATE_OPENAI_GLOBALS" ||
      event.data?.type === "INIT_OPENAI_BRIDGE"
    ) {
      applyGlobalsUpdate(event.data.globals as Partial<OpenAiGlobals> | undefined);
    }
  });
}

/**
 * Wait for window.openai to be available.
 * In production mode, this is injected by the client agent.
 * In standalone mode, we create a simulated bridge.
 */
async function initializeBridge(): Promise<void> {
  setupUpdateListener();

  // If real window.openai exists (production mode), use it
  if (window.openai) {
    console.log("[Bridge] Using real window.openai from client agent");
    return;
  }
  
  // Otherwise, wait for parent to send bridge data
  await setupBridgeFromParent();
}

/**
 * Mount the application
 */
async function mount() {
  // Initialize the bridge (real or simulated)
  await initializeBridge();

  const root = document.getElementById("root");
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

mount();
