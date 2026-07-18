# Ralph — the AFK loop

"Ralph" is a dead-simple loop that runs a coding agent over your issue backlog
**one slice at a time**, committing after each. It's the AFK (away-from-keyboard)
stage of the workshop: once the work is broken into small, well-defined issues,
the agent can grind through them unattended.

Each iteration, the loop feeds Claude Code:

- the last 5 git commits (so it knows what's already done), and
- every open issue file from `habit-tracker/issues/`,

then hands it [`prompt.md`](prompt.md), which tells it to **pick the next task,
implement it with `/tdd`, run the feedback loops (`npm run test`, `npm run
typecheck`), and commit.** When the backlog is empty the agent emits
`<promise>NO MORE TASKS</promise>` and the loop stops.

## Files

| File | What it does |
|------|--------------|
| `prompt.md` | The instructions given to the agent every iteration: task selection, TDD, feedback loops, commit format, issue bookkeeping. |
| `ralph-once.sh` | Run a **single** iteration. Good for watching one step end-to-end. |
| `ralph-loop.sh` | Run **N** iterations back-to-back, streaming the agent's output, stopping early when the backlog is exhausted. |

## Prerequisites

- Claude Code (`claude`) installed and authenticated.
- `habit-tracker/` must be a git repo with at least one commit (the loop reads
  `git log` and makes commits). If you cloned this workshop repo, that's already
  true — the whole repo is one git repo.
- The issue backlog: generate it earlier in the workshop with `/to-tickets`, which
  writes issue files into `habit-tracker/issues/`. Completed issues get moved to
  `habit-tracker/issues/done/`.
- `ralph-loop.sh` also needs `jq` for streamed output.

## Run it

Run from the **repo root**. The scripts locate the app in `habit-tracker/`
automatically (override with `APP_DIR=/path/to/app`).

```bash
# one iteration
./ralph/ralph-once.sh

# five iterations (stops early if the backlog empties)
./ralph/ralph-loop.sh 5

# run each iteration inside a Docker sandbox instead of a bare claude call
SANDBOX=1 ./ralph/ralph-loop.sh 5
```

> **Heads up:** these scripts run Claude Code with `--permission-mode
> bypassPermissions` so the agent can edit files and commit without prompting.
> That's what makes it "AFK." Only run it on a repo you're happy to let the agent
> change, ideally sandboxed (`SANDBOX=1`) or in a throwaway clone.

## How each iteration ends

- **Task finished** → the issue file is moved to `issues/done/` and a commit is made.
- **Task not finished** → a note is appended to the issue file describing what was
  done, so the next iteration can pick up where it left off.
- **Nothing left** → the agent prints `<promise>NO MORE TASKS</promise>` and
  `ralph-loop.sh` exits.
