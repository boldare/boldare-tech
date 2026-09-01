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

## The three suites

| Suite | What it checks | Target |
|---|---|---|
| `npm run test:smoke` | Crawls built HTML: every page has title/description/canonical/h1, no broken internal links, no missing images, sitemap + rss present | `../public` on disk |
| `npm run test:visual` | Screenshot diff at 375 / 768 / 1440px | `BASE_URL` |
| `npm run test:e2e` | Reader journeys, Algolia search, `/admin/` boots | `BASE_URL` |

Snapshots are platform-suffixed (`-linux.png`), so CI must run on Linux — `ubuntu-24.04`,
matching nyc-spa — or it will look for baselines that do not exist.

See `BASELINE.md` for what the pre-upgrade state actually was.

`BASE_URL` defaults to production. Point it at a local build to compare:

```bash
# capture baselines from the live site (do this FIRST, before touching the tree)
npm run test:visual:update

# later, after the upgrade, diff a local build against those baselines
cd .. && npm run build && npx gatsby serve &
cd tests && BASE_URL=http://localhost:9000/tech-blog/ npm run test:visual
```

`smoke` needs no server — it reads `public/` straight off disk, so it works the moment
`gatsby build` finishes.

## Why these tests

The site broke on 2026-08-25 with no code change, when GitHub disabled the `git://`
protocol and the Netlify install started failing. Nothing in the repo would have caught
that. `smoke` runs against the build output, so a build that stops producing pages fails
it. That is the point of the suite.
