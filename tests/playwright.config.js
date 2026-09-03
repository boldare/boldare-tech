const { defineConfig, devices } = require("@playwright/test");

// Defaults to production so baselines can be captured before the upgrade begins.
// Point at a local build with:
//   BASE_URL=http://localhost:9000/tech-blog/ npx playwright test
const BASE_URL = process.env.BASE_URL || "https://www.boldare.com/tech-blog/";

const chrome = devices["Desktop Chrome"];

module.exports = defineConfig({
  testDir: ".",
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    // Reads public/ off disk — a browser is used only to parse the HTML, so one
    // viewport is enough. Running this per-viewport would just triple the work.
    { name: "smoke", testMatch: /smoke\//, use: { ...chrome } },

    { name: "e2e", testMatch: /e2e\//, use: { ...chrome, viewport: { width: 1440, height: 900 } } },
  ],
});
