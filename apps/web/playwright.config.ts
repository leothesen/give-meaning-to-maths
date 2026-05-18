import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  webServer: {
    command: "pnpm build && pnpm start",
    port: 3210,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  use: { baseURL: "http://localhost:3210" },
});
