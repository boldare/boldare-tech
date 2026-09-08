---
title: "This Week's AI Bite: OpenAI's GPT-6 Astra – What It Means for Your Workflow"
cover: https://res.cloudinary.com/de4rvmslk/image/upload/v1788870491/Open_AI_Astra_g2mvxn.jpg
tags:
  - openai
  - gpt6
  - astra
postAuthor: Roksana Kaczmarska
---
**Weekly AI Bites gives you a direct look into our day-to-day AI work. Each post pulls insights, experiments, and real experiences straight from our team's meetings and Slack threads – the models we're testing, the problems we're running into, and what actually works in production. Follow Boldare's channels every Monday for the latest bite.**

## The launch

OpenAI introduced GPT-6 Astra on September 3, 2026, positioning it as the company's smartest and most well-aligned model yet. The release followed a staggered rollout across a single day: it first reached a small group of partner organizations, then moved to Business and Pro subscribers on the $100 and $200 monthly tiers, and within hours became available to Plus users on the standard $20 plan as well. API and AWS access is being extended over the following days, and Enterprise administrators will need to switch it on manually, since it isn't enabled by default at that tier.

How it performs

Astra's benchmark scores stand out:

* FrontierMath Tier 4 – 98%
* ARC-AGI-3 – 99.9%
* ExploitBench – 100%



OpenAI also claims the model runs computer-use tasks nearly twice as fast as its predecessor. Worth noting: a good part of that speed gain comes from improvements to the surrounding harness rather than the model itself — the same optimizations boosted GPT-5.6 Sol's speed by roughly 60%, too.

## What changes for developers using Codex

For anyone running long Codex sessions, this is the update that matters most. Until now, once a context window filled up, models fell back on compaction — condensing earlier work into a summary, which often meant losing the "why" behind a failed fix or how a given component actually behaves.

Astra takes a different route. It maintains ongoing notes that carry across context windows instead of collapsing everything into a single summary. On top of that, earlier context windows remain searchable, so the model can pull specific requirements or test results from past messages and tool outputs even when its own notes didn't capture them. The feature is opt-in right now, but OpenAI expects it to become the default within a few weeks.

## Beyond code: computer use and document generation

Astra combines computer-use capability — including background operation — with training geared toward professional workflows: handling multi-step tasks and producing finished documents, spreadsheets, and presentations. OpenAI is calling it their strongest model yet for software engineering. Through ChatGPT's Sites feature, it can also build, host, and share complete websites, web apps, and games.

## Access and pricing

The model is available via the API under the ID `gpt-6-astra`, with a 1M-token context window. Pricing is set at $10 per million input tokens and $50 per million output tokens, with cached input priced at $1, batch processing available at half price, and Fast mode running at twice the standard rate. For ChatGPT users, usage draws from existing subscription allowances, with the option to purchase additional credits if needed.

## On the safety front

OpenAI confirmed that Astra is the first of its models to hit the company's internal "Critical" cybersecurity threshold under its Preparedness Framework. As a result, the model's cyber-related capabilities are restricted to the Daybreak program rather than being rolled out broadly from day one.

Read the full announcement: [openai.com/index/gpt-6-astra](https://openai.com/index/gpt-6-astra/)

Curious what agentic capabilities like these could mean for your own product? Check out our [Agentic AI Implementation](URL_TO_FILL) service to see how we help teams put this kind of AI to work.
