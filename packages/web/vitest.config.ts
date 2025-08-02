import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.config.*",
        "**/*.test.*",
        "**/*.spec.*",
        "src/main.tsx",
        "src/assets/",
      ],
    },
    globals: true,
  },
});
