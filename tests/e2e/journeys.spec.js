const { test, expect } = require("@playwright/test");

// Selectors here are structural on purpose. Every styled element carries a
// JSS-generated class (jss5, jss122, ...) whose numbering is an artifact of
// stylesheet registration order — it is not stable across builds, and the
// react-jss 8 -> 10 upgrade renumbers all of them. Never select on those.
//
// Note also that the layout renders two <h1>s: the page heading and the InfoBox
// site title. Page assertions target the first.

const POST_LINK = "li a[href^='/tech-blog/']";

test("reader can go from the home list into a post", async ({ page }) => {
  await page.goto("");
  const firstPost = page.locator(POST_LINK).first();
  await expect(firstPost).toBeVisible();
  const href = await firstPost.getAttribute("href");

  await firstPost.click();
  await page.waitForURL(url => !/\/tech-blog\/?$/.test(url.pathname));

  expect(page.url()).toContain(href);
  await expect(page.locator("h1").first()).toBeVisible();
  expect(await page.title()).toBeTruthy();
});

test("tag pages list posts", async ({ page }) => {
  await page.goto("tags/php/");
  await expect(page.locator("h1").first()).toHaveText(/posts tagged with/i);
  await expect(page.locator(POST_LINK)).not.toHaveCount(0);
});

test("Algolia search returns results", async ({ page }) => {
  await page.goto("search/");
  const box = page.locator("input[type='search'], .ais-SearchBox input").first();

  // gatsby-config.js only wires Algolia when the credentials are in the build
  // environment, so a local build without them renders no search widget at all.
  // Skip rather than fail; CI and production builds have the keys and run this.
  if (!(await box.isVisible().catch(() => false))) {
    test.skip(true, "Search widget absent — this build had no ALGOLIA_* credentials");
  }

  await expect(box).toBeVisible();
  await box.fill("git");
  // Algolia is a live service; give it room but fail rather than hang.
  await expect(page.locator(".ais-Hits, .ais-Hits-list").first()).toBeVisible({
    timeout: 15000,
  });
});

test("the CMS admin panel boots", async ({ page, baseURL }) => {
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));

  // Relative on purpose. Locally `gatsby serve --prefix-paths` puts the panel at
  // /tech-blog/admin/; in production static/_redirects force-redirects that to
  // the unprefixed /admin/. Resolving relative to baseURL works in both.
  const adminURL = new URL("admin/", baseURL);
  await page.goto(adminURL.toString(), { waitUntil: "domcontentloaded" });

  // Assert on something only the CMS renders. An earlier version of this test
  // just checked the body was non-empty, which a 404 page satisfies -- it
  // passed against a deploy preview where /admin/ did not resolve at all.
  await expect
    .poll(async () => await page.locator("body").innerText(), { timeout: 25000 })
    .toMatch(/Login with Netlify Identity|Content Manager/i);

  expect(errors, `Uncaught errors while booting /admin/:\n${errors.join("\n")}`).toEqual([]);
});
