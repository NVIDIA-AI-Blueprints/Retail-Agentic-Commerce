import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", "kui-foundations-react-external/**", ".next/**"],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "vitest.setup.ts", "kui-foundations-react-external/"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./"),
      "@kui/foundations-react-external": resolve(
        __dirname,
        "./__mocks__/@kui/foundations-react-external.tsx"
      ),
      "@kui/foundations-design-tokens": resolve(
        __dirname,
        "./__mocks__/@kui/foundations-design-tokens.ts"
      ),
    },
  },
});
