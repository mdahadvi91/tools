import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.tsx", "node_modules"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@components": resolve(__dirname, "src/components"),
      "@data": resolve(__dirname, "src/data"),
      "@lib": resolve(__dirname, "src/lib"),
      "@hooks": resolve(__dirname, "src/hooks"),
      "@contexts": resolve(__dirname, "src/contexts"),
      "@constants": resolve(__dirname, "src/constants"),
      "@i18n": resolve(__dirname, "src/i18n"),
      "@tools": resolve(__dirname, "src/tools"),
      "@pages": resolve(__dirname, "src/pages"),
    },
  },
});
