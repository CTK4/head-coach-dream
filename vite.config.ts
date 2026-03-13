import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  base: './',
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: [/^@capacitor\//],
      output: {
        manualChunks: {
          // Core React runtime — cached independently from app code
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Radix UI primitives (large collection, changes rarely)
          "vendor-radix": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-context-menu",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-hover-card",
            "@radix-ui/react-label",
            "@radix-ui/react-menubar",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group",
            "@radix-ui/react-tooltip",
          ],
          // Charting library (heavy, rarely changes)
          "vendor-recharts": ["recharts"],
          // Form handling and validation
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          // Server-state management
          "vendor-query": ["@tanstack/react-query"],
        },
      },
    },
  },
  test: {
    // Exclude Playwright e2e specs; those run via `npm run test:ui`
    exclude: ["tests/**", "node_modules/**"],
    // Prefer process-based workers in this CI/container environment.
    // Thread-based pools can hang at shutdown and require manual termination.
    pool: "forks",
    // Keep all test files in a single worker process to avoid worker
    // teardown deadlocks in constrained environments.
    fileParallelism: false,
    maxWorkers: 1,
    // Fail fast if worker teardown gets stuck instead of hanging indefinitely.
    teardownTimeout: 10_000,
  },
}));
