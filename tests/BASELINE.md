# Pre-upgrade baseline

Captured 2026-09-01 from production, on `master` @ `3fee29e`, before any upgrade work.
This is the reference the Gatsby 5 migration is checked against.

## Site

| | |
|---|---|
| Live URL | https://www.boldare.com/tech-blog/ |
| `sitemap.xml` URLs | **148** — 27 posts, 1 page, 118 tag pages, plus `/`, `/search/`, `/tags/` |
| Visual baselines | 18 PNGs — 6 pages × 3 viewports (375 / 768 / 1440). Retired after the upgrade verified 18/18; see tests/README.md |
| e2e journeys | 4, all passing against production |

## CMS editorial workflow

**No open editorial-workflow entries.** Checked with `gh pr list` across all 21 open PRs
(every one is Dependabot) and every `cms/*` branch that has ever had a PR — all are
MERGED or CLOSED.

This matters for the Decap 3 migration. nyc-spa nearly lost editor access to 86 in-flight
drafts because Decap 3 filters the Workflow board by `decap-cms/*` labels while existing
PRs carry `netlify-cms/*`. **That risk is not live here** — there is nothing in flight to
lose. `cms_label_prefix: 'netlify-cms/'` should still be set (it is correct for anything
created between now and cutover, and costs nothing), but it is not the cutover blocker it
was for nyc-spa.

Three stale `cms/*` branches remain on the remote, all with merged PRs:
`cms/complex-command-handler-in-javascript`, `cms/quick-import-of-mysql-database-dump`,
`cms/weekly-ai-bites-last-manual-gap-qa-testing`. `refs/meta/_netlify_cms` also still
exists. Both are leftovers, not live state.

## Known instability in the visual baselines

The first capture attempt was unusable — a deterministic 8% diff on every re-run, because
`src/utils/shared.js` moves the navigator between its "featured" and "aside" states with
chained `setTimeout`s and `SpringScrollbars` runs rebound spring physics, so the page is
still animating at load. The suite now injects a stylesheet zeroing all animation and
transition durations, force-scrolls to trigger `react-lazyload`, waits for `document.fonts.ready`
and network idle, then settles for 2.5s. Three consecutive clean runs after that.

Residual noise remains from the live site itself (lazy covers, webfont timing), absorbed by
`retries`. Once the target is a local `gatsby serve` instead of production, expect it to be
steadier, not flakier.

## Not captured

- **Netlify build log Node version.** Needs Netlify dashboard access. Lower stakes than it
  was under the old phase-1 plan, since the target is now an explicit `NODE_VERSION = "24"`
  rather than "record whatever works today".
- **GTM container ID** for the analytics swap — needed before C2 can finish.

## Outcome

Verified against the final deploy preview on 2026-09-03:

- 18/18 screenshots matched pre-upgrade production, across 6 pages and 3 viewports.
- 9/9 journeys and widget metrics passed against the deployed site.
- 27 of 28 content pages render structurally identical to production. The
  exception is the table of contents on `Dev-and-prod-ready-Docker-setup-for-SPA-app`,
  which renders tight where production renders loose: the source has no blank
  lines between items, so CommonMark says tight and remark 9 had been lenient.
  Left as-is deliberately.
