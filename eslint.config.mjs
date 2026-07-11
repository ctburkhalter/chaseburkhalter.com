import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

// eslint-config-next 16 ships native flat-config arrays (this file used to
// wrap the legacy "next/core-web-vitals" shareable-config string via
// @eslint/eslintrc's FlatCompat, which broke under eslint-config-next 16:
// FlatCompat tries to normalize it as a legacy .eslintrc-shaped config and
// throws a circular-JSON error since the package no longer exports that
// shape at all). Importing the flat arrays directly means FlatCompat is no
// longer needed here.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "next-env.d.ts",
    "node_modules/**",
    "out/**",
    "resume/**",
  ]),
])

export default eslintConfig
