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
| `.agents/skills/` + `.claude/skills/` | Matt Pocock's skills — canonical files live in `.agents/skills/`, with `.claude/skills/*` symlinked to them so Claude Code picks them up. See [Install Matt Pocock's skills](#install-matt-pococks-skills) below. |
| `ralph/` | The "Ralph" AFK loop — scripts + prompt that drive the agent through the issue backlog one slice at a time. See [`ralph/README.md`](ralph/README.md). |

> The skills live in `.claude/skills/` at the repo root, so they're discovered by
> Claude Code anywhere in the repo. Launch `claude` from the repo root (or from
> `habit-tracker/`) and they'll be available as `/grill-me`, `/tdd`, etc.

## Install Matt Pocock's skills

The skills used in this workshop (`grill-me`, `grill-with-docs`, `tdd`, `to-spec`,
`to-tickets`, and more) aren't hand-copied — they're installed with
[skills.sh](https://skills.sh)'s CLI, which fetches them from
[`mattpocock/skills`](https://github.com/mattpocock/skills) and wires them up for
whichever coding agent(s) you pick (Claude Code, Cursor, Codex, ...):

```bash
npx skills@latest add mattpocock/skills
```

Pick the skills you want, select the agent(s) you use, and **make sure to select
`/setup-matt-pocock-skills`**. Then run it once per repo:

```
/setup-matt-pocock-skills
```

It'll ask which issue tracker you use (GitHub, Linear, or local files), what
triage labels you apply, and where to save generated docs (ADRs, glossary).

This creates a canonical copy of each skill in `.agents/skills/`, and a symlink
per agent (e.g. `.claude/skills/grill-me -> ../../.agents/skills/grill-me`) so
the same files work across every harness you selected.

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

The skills in `.agents/skills/` (symlinked from `.claude/skills/`) are installed
from [`mattpocock/skills`](https://github.com/mattpocock/skills) via
[skills.sh](https://skills.sh) and remain under their original license. The
workflow this workshop teaches is based on Matt Pocock's AI-development workflow.
