import { useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useDocumentTheme, applyDocumentTheme } from "@openai/apps-sdk-ui/theme";

const THEME_STORAGE_KEY = "acp-widget-theme";

/**
 * ThemeToggle Component
 *
 * A button that toggles between light and dark mode.
 * Persists the preference to localStorage.
 */
export function ThemeToggle() {
  const theme = useDocumentTheme();

  // Persist theme changes to localStorage
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    applyDocumentTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-default bg-surface-elevated transition-colors hover:bg-surface-secondary"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4 text-text-secondary" strokeWidth={1.5} />
      ) : (
        <Sun className="h-4 w-4 text-text-secondary" strokeWidth={1.5} />
      )}
    </button>
  );
}
