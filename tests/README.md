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

See `BASELINE.md` for what the pre-upgrade state actually was.

## Visual baselines must be made in the container

`monospace` is whatever font the operating system supplies, and it resolves three
different ways across a dev machine (DejaVu Sans Mono), a GitHub runner, and the
Playwright image (WenQuanYi Zen Hei Mono). Body text hides this, because Open Sans is a
webfont and is downloaded identically everywhere — code blocks and inline `<code>` do
not, and different glyph widths reflow the line around them. Baselines rasterised on a
host therefore fail in CI for reasons that have nothing to do with the site.

So capture and comparison both run in `mcr.microsoft.com/playwright`, which is what the
CI job uses too. **Never run `--update-snapshots` outside it** — `npm run
test:visual:update` on a host will produce baselines that only work on that host.

```bash
# regenerate baselines FROM PRODUCTION. The point of the suite is comparing against the
# pre-upgrade site, so this target stays production even after the upgrade ships.
docker run --rm --network host -v "$PWD":/tests -w /tests \
  --user "$(id -u):$(id -g)" -e HOME=/tmp \
  -e BASE_URL=https://www.boldare.com/tech-blog/ \
  mcr.microsoft.com/playwright:v1.62.1-noble \
  npx playwright test --project=desktop --project=tablet --project=mobile --update-snapshots

# compare a local build against them
cd .. && npm run build && npx gatsby serve --prefix-paths -p 9100 &
cd tests && docker run --rm --network host -v "$PWD":/tests -w /tests \
  --user "$(id -u):$(id -g)" -e HOME=/tmp \
  -e BASE_URL=http://localhost:9100/tech-blog/ \
  mcr.microsoft.com/playwright:v1.62.1-noble \
  npx playwright test --project=desktop --project=tablet --project=mobile
```

`smoke` and `e2e` have no such constraint and run fine on the host.

`smoke` needs no server — it reads `public/` straight off disk, so it works the moment
`gatsby build` finishes.

## Why these tests

The site broke on 2026-08-25 with no code change, when GitHub disabled the `git://`
protocol and the Netlify install started failing. Nothing in the repo would have caught
that. `smoke` runs against the build output, so a build that stops producing pages fails
it. That is the point of the suite.
