const { defineConfig, devices } = require("@playwright/test");

// Defaults to production so baselines can be captured before the upgrade begins.
// Point at a local build with:
//   BASE_URL=http://localhost:9000/tech-blog/ npx playwright test
const BASE_URL = process.env.BASE_URL || "https://www.boldare.com/tech-blog/";

const chrome = devices["Desktop Chrome"];

module.exports = defineConfig({
  testDir: ".",
  // Visual diffs against a live site carry some irreducible noise (lazy-loaded
  // covers, webfont timing, the Facebook SDK). One retry locally, two in CI.
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  expect: {
    toHaveScreenshot: {
      // Anti-aliasing and subpixel text rendering differ between machines, so
      // some tolerance is needed. 0.02 was too loose: it silently passed a real
      // regression where every post thumbnail rendered 90x51 instead of 90x90,
      // because the images are a small share of a full-page screenshot.
      maxDiffPixelRatio: 0.004,
      animations: "disabled",
    },
  },
  projects: [
    // Reads public/ off disk — a browser is used only to parse the HTML, so one
    // viewport is enough. Running this per-viewport would just triple the work.
    { name: "smoke", testMatch: /smoke\//, use: { ...chrome } },

    { name: "e2e", testMatch: /e2e\//, use: { ...chrome, viewport: { width: 1440, height: 900 } } },

    { name: "desktop", testMatch: /visual\//, use: { ...chrome, viewport: { width: 1440, height: 900 } } },
    { name: "tablet", testMatch: /visual\//, use: { ...chrome, viewport: { width: 768, height: 1024 } } },
    { name: "mobile", testMatch: /visual\//, use: { ...chrome, viewport: { width: 375, height: 812 } } },
  ],
});
