import { useCallback, useState } from "react";

interface UseCallToolResult<T> {
  call: (args: Record<string, unknown>) => Promise<T | null>;
  loading: boolean;
  error: Error | null;
}

/**
 * React hook for calling MCP tools with loading and error states.
 */
export function useCallTool<T = unknown>(
  toolName: string
): UseCallToolResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const call = useCallback(
    async (args: Record<string, unknown>): Promise<T | null> => {
      if (!window.openai?.callTool) {
        setError(new Error("window.openai.callTool not available"));
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await window.openai.callTool(toolName, args);
        return JSON.parse(response.result) as T;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error(`Tool call failed: ${toolName}`, error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toolName]
  );

  return { call, loading, error };
}
