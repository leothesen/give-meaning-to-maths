import next from "eslint-config-next/core-web-vitals";

/** Shared flat ESLint config for the monorepo (Next 16 native flat config). */
export default [
  ...next,
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
