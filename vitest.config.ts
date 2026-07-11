import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// Pure-logic unit tests only for now (event creators, weather data filters).
// No DOM/component rendering tests yet, so the default "node" environment is
// enough and keeps the suite fast and dependency-free.
export default defineConfig({
  resolve: {
    alias: {
      // Mirrors tsconfig.json's "@/*": ["./*"] so modules under test can use
      // the same @/ imports they use in the app.
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
})
