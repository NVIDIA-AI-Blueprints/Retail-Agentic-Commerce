import { useCallback, useEffect, useState, type SetStateAction } from "react";
import { usePersistedWidgetState } from "./use-openai-global";

/**
 * React hook for managing widget state that persists across re-renders
 * and is shared with the client agent.
 *
 * @param defaultState - Initial state if no persisted state exists
 * @returns [state, setState] tuple similar to useState
 */
export function useWidgetState<T extends Record<string, unknown>>(
  defaultState: T | (() => T)
): readonly [T, (state: SetStateAction<T>) => void] {
  // Get persisted state from window.openai
  const widgetStateFromWindow = usePersistedWidgetState() as T | null;

  // Local state initialized from window or default
  const [widgetState, _setWidgetState] = useState<T>(() => {
    if (widgetStateFromWindow) {
      return widgetStateFromWindow;
    }
    return typeof defaultState === "function" ? defaultState() : defaultState;
  });

  // Sync when window state changes (e.g., on re-render from new tool call)
  useEffect(() => {
    if (widgetStateFromWindow) {
      _setWidgetState(widgetStateFromWindow);
    }
  }, [widgetStateFromWindow]);

  // Setter that also persists to window.openai
  const setWidgetState = useCallback((state: SetStateAction<T>) => {
    _setWidgetState((prev) => {
      const newState = typeof state === "function" ? state(prev) : state;

      // Persist to window.openai (async, fire-and-forget)
      window.openai?.setWidgetState?.(newState).catch(console.error);

      return newState;
    });
  }, []);

  return [widgetState, setWidgetState] as const;
}
