# Virgo Group AI Coding Workshop

A workshop repo demonstrating how to build real features with a coding agent
using an **engineering** workflow instead of vibe coding.

`habit-tracker/` is a small, finished app that shipped a "motivation layer"
(streaks + stats) by walking the full pipeline:


## Prerequisites

- **Node.js 18+** and npm
- **Claude Code** installed and authenticated (`claude`) — https://claude.com/claude-code
- (Optional) `jq` and Docker, if you want to run the Ralph loop with streamed output / sandboxing

## What's in this repo

| Path | What it is |
|------|-----------|
| `habit-tracker/` | The example app — Next.js + TypeScript + SQLite. Single user, no auth. Ships **finished**, with `client-brief.md`, `prd/`, and `issues/done/` showing the workflow that built it. |
| `.claude/skills/` | The workshop skills, available to Claude Code across the whole repo: `grill-me`, `grill-with-docs`, `tdd`, `to-spec`, `to-tickets`. |
| `ralph/` | The "Ralph" AFK loop — scripts + prompt that drive the agent through the issue backlog one slice at a time. See [`ralph/README.md`](ralph/README.md). |

> The skills live in `.claude/skills/` at the repo root, so they're discovered by
> Claude Code anywhere in the repo. Launch `claude` from the repo root (or from
> `habit-tracker/`) and they'll be available as `/grill-me`, `/tdd`, etc.

## Quickstart — run the habit-tracker

```bash
git clone <this-repo-url>
cd ai-coding-workshop/habit-tracker

npm install
npm run dev          # http://localhost:3000
```

Other useful commands (from `habit-tracker/`):

```bash
npm run test         # run the vitest suite
npm run typecheck    # tsc --noEmit
```

Poke around the running app: create a habit, check it in, view the stats page.
Streaks and completion-rate stats are the "motivation layer" the workflow below
was used to build.

## Study the worked example

1. **Read the brief.** `habit-tracker/client-brief.md` — a vague Slack message
   from a PM asking for "some kind of motivation layer." The vagueness is the
   point: it's what made the next steps worth doing.
2. **See the alignment turn into a spec.** `habit-tracker/prd/PRD-streaks.md` and
   `PRD-stats.md` are what came out of a `/grill-me` session on that brief —
   problem statement, decisions, scope.
3. **See the PRDs turn into slices.** `habit-tracker/issues/done/` holds the
   vertical-slice issues cut from those PRDs — each one small, end-to-end, and
   independently verifiable.
4. **See how the slices got built.** `git log` in `habit-tracker/` for the commit
   history; each issue was implemented with `/tdd` and run through the Ralph AFK
   loop. See [`ralph/README.md`](ralph/README.md) for how that loop works.

## Apply the workflow to your own feature

1. **Align — `/grill-me`.** From `habit-tracker/`, start a fresh Claude Code
   session and run `/grill-me` on your own brief or idea. It interviews you one
   question at a time until the ambiguity is resolved.
2. **Write the PRD — `/to-spec`.** Turn the aligned understanding into a PRD.
3. **Break into issues — `/to-tickets`.** Slice the PRD into small, vertical,
   independently-verifiable issues in `issues/`.
4. **Run the Ralph loop.** Let the agent work the backlog AFK, TDD-style. See
   [`ralph/README.md`](ralph/README.md).
5. **Review & QA.** Review the diff with fresh context, then run the app and check
   the feature by hand.

## Attribution

The skills in `.claude/skills/` are vendored from
[`mattpocock/skills`](https://github.com/mattpocock/skills) and remain under their
original license. The workflow this workshop teaches is based on Matt Pocock's
AI-development workflow.
