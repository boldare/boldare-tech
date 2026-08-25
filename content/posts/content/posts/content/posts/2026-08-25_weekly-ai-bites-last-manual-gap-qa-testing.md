---
title: "This Week's AI Bite: The Last Manual Gap in QA Testing Is Closed"
subTitle: "How a set of Claude Code skills and a biometric automation breakthrough closed the final manual bottleneck in end-to-end QA"
tags: ["ai", "claude-code", "qa", "test-automation", "skills"]
cover: weekly-ai-bites-qa-testing.jpg
postAuthor: Milena Cylińska

---

Weekly AI Bites is a series offering a direct window into our day-to-day AI work. Each post shares insights, experiments, and real experiences straight from our team's meetings and Slack conversations — the models we're testing, the challenges we're working through, and what's actually delivering results in live products. To keep up with what's happening in AI, check Boldare's channels every Monday for the newest bite.

As a QA and test automation engineer, I build a fair number of Claude Code skills for commercial projects, and nearly all of them exist for a single purpose: testing. Here I want to walk through the set I rely on daily, along with a recent shift on one project where a long-standing manual bottleneck was finally automated away.

## Starting point

I don't have a long list of flashy, off-the-shelf skills to recommend — aside from Claude's built-in skill-creator. What I do have are four skills, purpose-built for QA on one specific client project, that I use constantly:

- **manual-tester** — exploratory, black-box QA run against a live staging environment. It checks environment connectivity first, then acceptance criteria, reads the feature's documentation for context, and tests every acceptance criterion across all supported languages and on both frontend and backend before compiling a report.
- **test-planner** — designs end-to-end test coverage for a feature before a single line of code is written.
- **playwright-test** — takes a plan and generates specs, page objects, and fixtures for the E2E suite, following the project's existing conventions.
- **verify-known-quirks** — seeds and re-checks a knowledge base of known QA quirks against live ticket data. Run occasionally, never as part of a routine test pass.

manual-tester carries the most weight. Before touching anything, it requests acceptance criteria, sharpens them, and comes up with its own edge cases. If a feature needs a local environment, it sets that up first. The real value isn't the browser automation itself — it's that the skill front-loads the thinking a human tester would normally have to do manually, before any test is even run.

## Two speeds of context, by design

One detail I'm particularly happy with: these skills don't rely solely on pasted-in acceptance criteria or on memory. They pull live ticket context and cross-reference it against a curated quirks store — and the two are deliberately engineered to run at different speeds.

The live per-ticket fetch covers the current status, acceptance criteria, and comments for a single ticket. It's pulled fresh every single time and never cached, living in a disposable, gitignored cache. A subagent handles the raw ticket call and returns only a condensed summary, since a full ticket can run 5–20KB of bilingual spec text.

The known-quirks knowledge base, by contrast, holds cross-ticket QA quirks, won't-fix decisions, and already-diagnosed root causes. It's built once and updated only through an explicit verification run, stored in committed, curated files — one per quirk. Entries move through confidence tiers: unverified-seed, then verified-single-source, then confirmed.

A separate, self-checking log tracks behavioral divergences that are anchored to a test deliberately built to fail: if the underlying bug ever gets fixed, that test flips to red on its own, so the log can never quietly become outdated. Quirks that can't be anchored this way — tied to a live KYC-verified account, an admin session, or timing dependencies — go through the confidence-tier process instead, only reaching "confirmed" status after a human signs off.

## The bottleneck that finally gave way

For months, one identity-verification step in the product under test could only be run manually, since the biometric check couldn't be safely automated. That meant manual-tester could push a feature into a verified state, but never carry it fully through — genuine end-to-end coverage wasn't possible.

That changed once a colleague delivered automation for the biometric flow itself: real ID document and facial data fed into the browser's spoofed camera, with a freshly generated identity stamped onto the document image so the verification service treats it as current. Every run spins up a brand-new disposable account and deletes it automatically after 2 days, so no shared data ever gets touched.

With that piece solved, manual-tester can now carry a ticket through the entire flow on its own, not just up to the point where a human previously had to step in. That same week, three new automated checks were added on top of it: verification in an additional supported language, a check that denying camera access produces the correct, recoverable error message, and a check that a name pulled from a scanned document renders correctly throughout the interface.

## What's working

- **Front-loaded thinking** — the skill refines acceptance criteria and generates edge cases before a single test runs.
- **Two-speed context** — live ticket data stays current on every run, while durable quirks remain curated and, where possible, self-verifying.
- **No more manual ceiling** — a flow that used to require a human at the final step now runs end-to-end without one.

Every skill is put through evals, and token cost is tracked as a genuine metric rather than an afterthought — a skill that technically works but burns excess context isn't worth keeping.

## Limitations

- Biometric verification against injected video is probabilistic rather than deterministic — occasional rejection windows occur, and the fix is to wait and retry rather than spin up more registrations.
- Backend log verification depends on an identity-gated dashboard, so some assertions can't run fully unattended.
- The underlying service rate-limits bursts of activity, forcing test layers to run serially instead of in parallel.
- These skills were built around one commercial project's specific structure, so they can't be dropped into another codebase without generalizing the assumptions baked into them.

## What's next

Some of these skills generalize more cleanly than others — the plan is to strip out the client-specific pieces from manual-tester, playwright-test, and the underlying skill-building approach, so they can serve as a reusable starting point on other projects, and to publish anonymized versions to Boldare's internal Claude Code skill marketplace.

*Technical note: a Claude Code skill is a folder containing a SKILL.md file with instructions, optionally packaged with scripts and reference material. Claude only loads a skill's full contents once it determines a task actually needs it — until invoked, a skill costs next to nothing in context. That's what makes it practical to keep dozens of narrow, project-specific skills installed simultaneously without paying a constant token cost for their mere presence.*

## Takeaway

The most useful Claude Code skills grow out of repetitive QA work, not a chase for novelty. A skill earns its keep when it removes a bottleneck a human previously had to sit through by hand — and proves, through evals and token cost, that it's still worth keeping around.

---

Curious how this kind of AI-powered QA setup could work for your team? Check out [Boldare's AI-Powered QA & Test Automation services](https://www.boldare.com/services/ai-augmented-testing/) — we build the same kind of tooling we use internally into production CI/CD pipelines, from an initial audit through full automation.
