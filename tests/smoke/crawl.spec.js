const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");

// Reads the build output straight off disk — no server needed, so this runs the
// moment `gatsby build` finishes. That matters: a build that silently stops
// producing pages is exactly the failure this suite exists to catch.
const PUBLIC = path.resolve(__dirname, "../../public");

// pathPrefix from gatsby-config.js. Built HTML links are prefixed (`--prefix-paths`)
// while the files on disk are not, so every internal URL needs the prefix stripped
// before it can be resolved to a file.
const PATH_PREFIX = "/tech-blog";

// Pages that legitimately do not look like content pages.
const NOT_CONTENT = [/^admin\//, /^404\.html$/, /^404\//];

function htmlFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full, base);
    return entry.name.endsWith(".html") ? [path.relative(base, full)] : [];
  });
}

function isContentPage(rel) {
  return !NOT_CONTENT.some(re => re.test(rel));
}

// Resolve a URL as it appears in built HTML to a path inside public/, or null if
// the URL is external / not a thing we can check on disk.
function toDiskPath(url) {
  if (!url) return null;
  if (/^(https?:)?\/\//i.test(url)) return null;
  if (/^(mailto:|tel:|data:|javascript:)/i.test(url)) return null;
  let p = url.split("#")[0].split("?")[0];
  if (!p || p.startsWith("#")) return null;
  if (!p.startsWith("/")) return null;
  if (p.startsWith(PATH_PREFIX + "/") || p === PATH_PREFIX) {
    p = p.slice(PATH_PREFIX.length) || "/";
  }
  const candidate = path.join(PUBLIC, p);
  return p.endsWith("/") || !path.extname(p)
    ? path.join(candidate, "index.html")
    : candidate;
}

const pages = htmlFiles(PUBLIC);

// Locally the harness is often run before any build exists (that is the whole
// point of C1 — it must be usable while the root tree is still Gatsby 2 and
// cannot build at all). Skip rather than fail there. In CI a build always runs
// first, so a missing public/ there is a real failure and must not be skipped.
test.skip(
  !fs.existsSync(PUBLIC) && !process.env.CI,
  `No build output at ${PUBLIC} — run \`npm run build\` in the repo root first.`
);

test.describe("build output", () => {
  test("the build produced pages", () => {
    expect(
      pages.length,
      `No HTML found in ${PUBLIC}. Run \`npm run build\` in the repo root first.`
    ).toBeGreaterThan(0);

    // 27 posts + 1 page + ~118 tag pages + index/search/tags/404 on the last
    // known-good build. A sudden collapse means the data layer stopped resolving.
    expect(
      pages.length,
      `Only ${pages.length} pages built; production sitemap listed 148 URLs. ` +
        `A large drop usually means a GraphQL query silently returned nothing.`
    ).toBeGreaterThan(100);
  });

  test("sitemap.xml and rss.xml exist and are non-empty", () => {
    for (const file of ["sitemap.xml", "rss.xml"]) {
      const full = path.join(PUBLIC, file);
      expect(fs.existsSync(full), `${file} was not generated`).toBe(true);
      expect(fs.statSync(full).size, `${file} is empty`).toBeGreaterThan(200);
    }
  });
});

test.describe("every page", () => {
  test("has a title, description, canonical and h1", async ({ page }) => {
    const problems = [];

    for (const rel of pages.filter(isContentPage)) {
      await page.goto("file://" + path.join(PUBLIC, rel));
      const found = await page.evaluate(() => ({
        title: document.title,
        description: document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content"),
        canonical: document
          .querySelector('link[rel="canonical"]')
          ?.getAttribute("href"),
        ogUrl: document
          .querySelector('meta[property="og:url"]')
          ?.getAttribute("content"),
        h1: document.querySelector("h1")?.textContent?.trim(),
        bodyLength: document.body?.innerText?.trim().length ?? 0,
      }));

      // nyc-spa shipped /blog/ with no head tags at all and a bare-domain og:url
      // on 12 pages. Both were invisible until someone looked.
      if (!found.title) problems.push(`${rel}: no <title>`);
      if (!found.description) problems.push(`${rel}: no meta description`);
      if (!found.canonical) problems.push(`${rel}: no canonical`);
      if (found.ogUrl && new URL(found.ogUrl).pathname === "/") {
        problems.push(`${rel}: og:url is the bare domain (${found.ogUrl})`);
      }
      if (!found.h1) problems.push(`${rel}: no <h1>`);
      if (found.bodyLength < 50) {
        problems.push(`${rel}: body has ${found.bodyLength} chars of text`);
      }
    }

    expect(problems.join("\n"), `${problems.length} page(s) with head/content problems`).toBe("");
  });
});

test.describe("links and images", () => {
  test("no broken internal links", async ({ page }) => {
    const broken = new Map();

    for (const rel of pages) {
      await page.goto("file://" + path.join(PUBLIC, rel));
      const hrefs = await page.$$eval("a[href]", els =>
        els.map(el => el.getAttribute("href"))
      );
      for (const href of hrefs) {
        const disk = toDiskPath(href);
        if (disk && !fs.existsSync(disk)) {
          if (!broken.has(href)) broken.set(href, new Set());
          broken.get(href).add(rel);
        }
      }
    }

    const report = [...broken.entries()].map(
      ([href, from]) => `${href}  <- ${[...from].slice(0, 3).join(", ")}`
    );
    expect(report.join("\n"), `${broken.size} broken internal link target(s)`).toBe("");
  });

  test("no images with a missing file", async ({ page }) => {
    const missing = new Map();

    for (const rel of pages.filter(isContentPage)) {
      await page.goto("file://" + path.join(PUBLIC, rel));
      const srcs = await page.$$eval("img[src], source[srcset]", els =>
        els.flatMap(el => {
          const src = el.getAttribute("src");
          const srcset = el.getAttribute("srcset");
          const fromSet = srcset
            ? srcset.split(",").map(part => part.trim().split(/\s+/)[0])
            : [];
          return src ? [src, ...fromSet] : fromSet;
        })
      );
      for (const src of srcs) {
        const disk = toDiskPath(src);
        if (disk && !fs.existsSync(disk)) {
          if (!missing.has(src)) missing.set(src, new Set());
          missing.get(src).add(rel);
        }
      }
    }

    const report = [...missing.entries()].map(
      ([src, from]) => `${src}  <- ${[...from].slice(0, 3).join(", ")}`
    );
    expect(report.join("\n"), `${missing.size} image(s) with no file on disk`).toBe("");
  });
});
