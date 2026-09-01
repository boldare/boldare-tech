const { test, expect } = require("@playwright/test");

// Baselines are captured from production BEFORE the upgrade, then diffed against a
// local build afterwards. The JSS style objects do not change during the migration,
// so the expectation is near-zero drift: any diff here is a real signal and should
// be explained, not waved through with --update-snapshots.
const PAGES = [
  { name: "home", path: "" },
  { name: "post", path: "quick-import-of-mysql-database-dump/" },
  { name: "page", path: "how-to-contribute/" },
  { name: "tags-index", path: "tags/" },
  { name: "tag", path: "tags/php/" },
  { name: "search", path: "search/" },
];

// Third-party embeds render differently on every run and are not ours to regress.
const VOLATILE = [
  "#fb-root",
  ".fb-comments",
  "iframe",
  ".ais-Stats", // Algolia result counts and timings
];

// src/utils/shared.js drives the navigator between its "featured" and "aside"
// states with chained setTimeouts, and SpringScrollbars runs rebound spring
// physics. Both are still mid-flight at load, which is what made the first
// attempt at these baselines differ by a deterministic 8%. Kill animation and
// let the timer chain finish before looking at the page.
const SETTLE_MS = 2500;

async function freezeAndSettle(page) {
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
      caret-color: transparent !important;
    }`,
  });

  // react-lazyload only mounts cover images once they scroll into view.
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let y = 0;
      const step = () => {
        window.scrollTo(0, y);
        y += window.innerHeight;
        if (y < document.body.scrollHeight) requestAnimationFrame(step);
        else {
          window.scrollTo(0, 0);
          resolve();
        }
      };
      step();
    });
  });

  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(SETTLE_MS);
}

for (const { name, path: p } of PAGES) {
  test(`${name} matches baseline`, async ({ page }) => {
    await page.goto(p, { waitUntil: "networkidle" });
    await freezeAndSettle(page);

    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      mask: VOLATILE.map(sel => page.locator(sel)),
    });
  });
}
