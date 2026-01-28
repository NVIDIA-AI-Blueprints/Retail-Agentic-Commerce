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

/**
 * Create a simulated window.openai object for standalone mode.
 * This mimics what the client agent injects in production.
 */
function createSimulatedOpenAi(globals?: Partial<OpenAiGlobals>): OpenAiGlobals {
  return {
    theme: globals?.theme ?? "dark",
    locale: globals?.locale ?? "en-US",
    maxHeight: globals?.maxHeight ?? 600,
    displayMode: globals?.displayMode ?? "inline",
    toolInput: globals?.toolInput ?? {},
    toolOutput: globals?.toolOutput ?? simulatedToolOutput,
    widgetState: globals?.widgetState ?? null,

    // Methods that communicate with parent
    setWidgetState: async (state: unknown) => {
      console.log("[SimulatedBridge] setWidgetState:", state);
    },

    callTool: async (name: string, args: Record<string, unknown>) => {
      console.log("[SimulatedBridge] callTool:", name, args);
      
      // Send to parent for processing
      window.parent.postMessage({ type: "CALL_TOOL", toolName: name, args }, "*");
      
      // Wait for response
      return new Promise((resolve) => {
        const handleResponse = (event: MessageEvent) => {
          if (event.data?.type === "TOOL_RESULT" && event.data?.toolName === name) {
            window.removeEventListener("message", handleResponse);
            resolve({ result: event.data.result });
          }
        };
        window.addEventListener("message", handleResponse);
        
        // Timeout after 30 seconds
        setTimeout(() => {
          window.removeEventListener("message", handleResponse);
          resolve({ result: JSON.stringify({ success: false, error: "Timeout" }) });
        }, 30000);
      });
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

/**
 * Wait for window.openai to be available.
 * In production mode, this is injected by the client agent.
 * In standalone mode, we create a simulated bridge.
 */
async function initializeBridge(): Promise<void> {
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
