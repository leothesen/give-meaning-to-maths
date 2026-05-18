import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

/** Shared flat ESLint config for the monorepo (Next 16 / ESLint 9). */
export default [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [
      "**/.next/**",
      "**/out/**",
      "**/node_modules/**",
      "**/playwright-report/**",
      "**/test-results/**",
    ],
  },
];
