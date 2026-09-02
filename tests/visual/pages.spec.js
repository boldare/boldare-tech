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
  { name: "search", path: "search/", requiresAlgolia: true },
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
  // Netlify injects a deploy-preview collaboration drawer (an iframe from
  // app.netlify.com) that exists on previews and nowhere else. Masking it would
  // paint a block the production baseline does not have, so remove it outright.
  await page.evaluate(() => {
    document
      .querySelectorAll('iframe[src*="app.netlify.com"], iframe[src*="netlify.com/cdp"]')
      .forEach(el => el.remove());
  });

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

for (const { name, path: p, requiresAlgolia } of PAGES) {
  test(`${name} matches baseline`, async ({ page }) => {
    await page.goto(p, { waitUntil: "networkidle" });

    // gatsby-config.js only registers Algolia when the credentials are present
    // in the build environment, so a local build without them renders no search
    // widget and the comparison would be against a page that cannot exist here.
    if (requiresAlgolia) {
      const box = page.locator(".ais-SearchBox, input[type='search']").first();
      if (!(await box.isVisible().catch(() => false))) {
        test.skip(true, "Search widget absent — this build had no ALGOLIA_* credentials");
      }
    }

    await freezeAndSettle(page);

    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      mask: VOLATILE.map(sel => page.locator(sel)),
    });
  });
}
