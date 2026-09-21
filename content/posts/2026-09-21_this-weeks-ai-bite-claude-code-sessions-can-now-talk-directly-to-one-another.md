---
title: "This week's AI Bite: Claude Code sessions can now talk directly to one
  another"
cover: https://res.cloudinary.com/de4rvmslk/image/upload/v1790000557/Claude_Code_Karol_hnogzo.png
tags:
  - Claude Code
  - AI Agents
  - Multi-agent Systems
  - Developer Tools
  - AI Coding Assistant
  - Software Engineering
postAuthor: Karol Kasprzak
---
As a Senior Software Engineer, I stumbled onto something by accident this week – a capability that's apparently been quietly available in Claude Code for a month. Two separate sessions of mine were able to exchange messages with each other.

**The mechanism**

Two commands make this possible. ListAgents lets a session see which other Claude Code sessions are currently running on the same machine. SendMessage delivers a message to a chosen session, functioning exactly as if a person had typed it directly into that session's terminal – and the receiving session responds the same way.

**How I used to handle this**

When running several agents in parallel – each working in its own worktree on related pieces of a task – getting information from one to another meant either manually copying text between terminal windows, or rigging up a makeshift relay: a shared file where one agent would write and another would check for updates. Functional, but clunky.

**What happened this time**

![](/img/claude-code-session.png "Claude code session")

A reviewer raised a question about an implementation detail that only one of my sessions (Session A) had the context for. Rather than switching terminals and re-tracing the code myself, I simply asked Session B to relay the question. It came back with a full answer, reasoning included, which I passed straight to the reviewer – no manual copying involved.

**Not the same as subagents**

The first reaction I got when sharing this was: "isn't that just how the main agent already talks to its subagents?" Not quite. What's happening here is two fully independent Claude Code instances communicating – separate processes, separate worktrees, separate contexts entirely. And it's not confined to a single machine either: with Remote Control enabled, sessions running on different computers can reach each other too.

**A few practical details**

* Available since v2.1.224 (August 7) on macOS, Linux, and WSL 2; native Windows support arrived in v2.1.234.
* No setup required — it's active by default.
* Only plain text is exchanged; neither conversation history nor files are shared automatically. To transfer full context, you still need /resume.
* As of v2.1.232, tagging a session with @session-name in your prompt is enough to send it a message.
* Sessions can message each other autonomously, without a human initiating it, if you allow that. This is governed by the crossSessionInbound setting (accept / hold / refuse). Messages sent off the local machine can also be configured to require your manual approval, even under bypassPermissions.


**Things to keep in mind**

* The feature isn't without growing pains: after an automatic update from 2.1.258 to 2.1.260, some users found SendMessage had stopped working in sessions that were already open. If something seems broken post-update, this is a known issue.
* One question worth sitting with: if agents can talk to each other unsupervised, could one end up interfering in a session it has no business touching? The honest answer is yes — but only if you've configured it to allow that. That's precisely what crossSessionInbound: refuse is there to prevent.


For anyone juggling multiple agents on interconnected tasks, the manual back-and-forth just became optional – at least in my workflow.
