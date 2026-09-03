# Verification harness

Self-contained: its own `package.json` and lockfile, installed and run independently of
the repo root. That is deliberate — the baselines have to be captured *before* the
upgrade starts, while the root is still the Gatsby 2 tree that will not `npm install`
on Node 24.

```bash
cd tests
npm ci
npx playwright install chromium
```

## The two suites

| Suite | What it checks | Target |
|---|---|---|
| `npm run test:smoke` | Crawls built HTML: every page has title/description/canonical/h1, no broken internal links, no missing images, sitemap + rss present. Also checks the Algolia query and transformer, which no build without credentials ever exercises | `../public` on disk |
| `npm run test:e2e` | Reader journeys, Algolia search, `/admin/` boots, and the widget metrics MUI 9 changed | `BASE_URL` |

## There used to be a screenshot suite

Six pages x three viewports, diffed against baselines captured from production
before the Gatsby 5 upgrade. It answered one question — "does the upgraded site
still look like the site as it was?" — confirmed 18/18 against the final deploy
preview, and was removed once that question was settled. Keeping it would have
meant comparing forever against a site that no longer exists.

Its durable half lives on in `e2e/widget-metrics.spec.js`. Screenshot diffing
turned out to be poor at exactly the things that broke here: small chrome is a
rounding error on a full-page image, and `toHaveScreenshot`'s own per-pixel
`threshold` (0.2 by default) makes a whole-page shade change invisible. Asserting
computed values instead is deterministic, needs no container, and caught what the
pixels missed.

See `BASELINE.md` for what the pre-upgrade state actually was.



`smoke` needs no server — it reads `public/` straight off disk, so it works the moment
`gatsby build` finishes.

## Why these tests

The site broke on 2026-08-25 with no code change, when GitHub disabled the `git://`
protocol and the Netlify install started failing. Nothing in the repo would have caught
that. `smoke` runs against the build output, so a build that stops producing pages fails
it. That is the point of the suite.
