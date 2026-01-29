/**
 * MCP Client Hook
 *
 * Properly connects to the MCP server and calls tools to discover widget URIs.
 * The client has NO hardcoded knowledge of widget URLs - it discovers them
 * by calling MCP tools and reading the _meta.openai/outputTemplate response.
 *
 * Flow:
 * 1. Connect to MCP server
 * 2. Call a tool
 * 3. Extract widget URI from _meta.openai/outputTemplate
 * 4. Resolve URI to HTTP URL
 */

import { useState, useCallback } from "react";

/**
 * MCP Server base URL - only the server address, NOT the widget path
 */
const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || "http://localhost:2091";

/**
 * MCP tool response structure
 */
interface MCPToolResponse {
  jsonrpc: string;
  id: number;
  result?: {
    content?: Array<{ type: string; text: string }>;
    structuredContent?: Record<string, unknown>;
    _meta?: {
      "openai/outputTemplate"?: string;
      "openai/widgetAccessible"?: boolean;
      [key: string]: unknown;
    };
  };
  error?: {
    code: number;
    message: string;
  };
}

/**
 * MCP client state
 */
interface MCPClientState {
  isLoading: boolean;
  error: string | null;
  widgetUrl: string | null;
  widgetUri: string | null;
  toolResult: Record<string, unknown> | null;
}

/**
 * Resolve a ui://widget/... URI to an HTTP URL using the MCP server base
 */
function resolveWidgetUri(uri: string, mcpServerUrl: string): string {
  if (uri.startsWith("ui://widget/")) {
    const path = uri.replace("ui://widget/", "/widget/");
    return `${mcpServerUrl}${path}`;
  }
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return uri;
  }
  return `${mcpServerUrl}${uri}`;
}

/**
 * Hook to interact with the MCP server via proper JSON-RPC protocol
 */
export function useMCPClient() {
  const [state, setState] = useState<MCPClientState>({
    isLoading: false,
    error: null,
    widgetUrl: null,
    widgetUri: null,
    toolResult: null,
  });

  /**
   * Call an MCP tool and extract the widget URI from the response.
   * This is the PROPER way to discover widget URLs - by calling tools.
   */
  const callTool = useCallback(
    async (
      toolName: string,
      args: Record<string, unknown> = {}
    ): Promise<{
      widgetUrl: string | null;
      widgetUri: string | null;
      result: Record<string, unknown> | null;
      error: string | null;
    }> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Call MCP server using JSON-RPC protocol
        // MCP app is mounted at /api, its internal route is /mcp → /api/mcp
        const response = await fetch(`${MCP_SERVER_URL}/api/mcp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/event-stream",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: Date.now(),
            method: "tools/call",
            params: {
              name: toolName,
              arguments: args,
            },
          }),
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          throw new Error(`MCP server returned ${response.status}: ${response.statusText}`);
        }

        let mcpResponse: MCPToolResponse | null = null;

        // Parse response - MCP uses SSE format
        const text = await response.text();

        // Parse SSE stream to find the result
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.result || data.error) {
                mcpResponse = data;
              }
            } catch {
              // Continue parsing
            }
          }
        }

        // If no SSE data found, try parsing as plain JSON
        if (!mcpResponse) {
          try {
            mcpResponse = JSON.parse(text);
          } catch {
            // Not valid JSON
          }
        }

        if (!mcpResponse) {
          throw new Error("No valid response from MCP server");
        }

        if (mcpResponse.error) {
          throw new Error(`MCP error: ${mcpResponse.error.message}`);
        }

        // Extract widget URI from _meta.openai/outputTemplate
        const meta = mcpResponse.result?._meta;
        const widgetUri = meta?.["openai/outputTemplate"] || null;

        if (!widgetUri) {
          throw new Error(
            "MCP tool response does not contain widget URI in _meta.openai/outputTemplate"
          );
        }

        // Resolve the URI to an HTTP URL
        const widgetUrl = resolveWidgetUri(widgetUri, MCP_SERVER_URL);

        setState({
          isLoading: false,
          error: null,
          widgetUrl,
          widgetUri,
          toolResult: mcpResponse.result?.structuredContent || null,
        });

        return {
          widgetUrl,
          widgetUri,
          result: mcpResponse.result?.structuredContent || null,
          error: null,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "MCP call failed";

        setState({
          isLoading: false,
          error: errorMessage,
          widgetUrl: null,
          widgetUri: null,
          toolResult: null,
        });

        return {
          widgetUrl: null,
          widgetUri: null,
          result: null,
          error: errorMessage,
        };
      }
    },
    []
  );

  /**
   * Call an MCP tool without requiring a widget URI response.
   * Used for tools like get-recommendations that return data, not widget URIs.
   */
  const callToolSimple = useCallback(
    async (
      toolName: string,
      args: Record<string, unknown> = {}
    ): Promise<Record<string, unknown> | null> => {
      try {
        const response = await fetch(`${MCP_SERVER_URL}/api/mcp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/event-stream",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: Date.now(),
            method: "tools/call",
            params: {
              name: toolName,
              arguments: args,
            },
          }),
          signal: AbortSignal.timeout(65000), // 65s timeout for ARAG agent (takes ~25s)
        });

        if (!response.ok) {
          throw new Error(`MCP server returned ${response.status}`);
        }

        let mcpResponse: MCPToolResponse | null = null;
        const text = await response.text();
        console.log("[MCP] Raw response text (first 500 chars):", text.slice(0, 500));

        // Parse SSE stream
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.result || data.error) {
                mcpResponse = data;
                console.log("[MCP] Parsed SSE data:", data);
              }
            } catch {
              // Continue parsing
            }
          }
        }

        // Try plain JSON if no SSE
        if (!mcpResponse) {
          try {
            mcpResponse = JSON.parse(text);
            console.log("[MCP] Parsed as plain JSON:", mcpResponse);
          } catch {
            // Not valid JSON
          }
        }

        if (!mcpResponse) {
          throw new Error("No valid response from MCP server");
        }

        if (mcpResponse.error) {
          throw new Error(`MCP error: ${mcpResponse.error.message}`);
        }

        console.log("[MCP] Returning structuredContent:", mcpResponse.result?.structuredContent);
        return mcpResponse.result?.structuredContent || null;
      } catch (error) {
        console.error("MCP tool call failed:", error);
        throw error;
      }
    },
    []
  );

  /**
   * Get widget URL by calling the search-products tool.
   * The widget URI is discovered from the tool response, NOT hardcoded.
   *
   * search-products is the entry point tool per the Apps SDK spec that
   * returns products and exposes the widget URI in _meta.openai/outputTemplate.
   */
  const getWidgetUrl = useCallback(
    async (query: string = "tee") => {
      return callTool("search-products", { query, limit: 10 });
    },
    [callTool]
  );

  return {
    ...state,
    callTool: callToolSimple,
    callToolWithWidget: callTool,
    getWidgetUrl,
    mcpServerUrl: MCP_SERVER_URL,
  };
}
