# Journal chip streak badge

## Parent

PRD-streaks.md (Habit Streaks)

## What to build

Show a streak badge on journal chips for daily habits, using the per-habit streak now returned by `GET /api/habits` (see Issue 3). This is UI-only — the journal page (`src/app/page.tsx`) is a thin consumer of the already-computed streak value.

- Every chip representing a logged check-in for a daily habit shows its current streak (e.g. "Reading 🔥 3"), regardless of which day-card (date) the chip is rendered under.
- The number shown is always the same — today's current streak — never a historical value for that specific date. Chips for the same habit look identical no matter which day-card they appear on.
- The badge/text only appears once the streak reaches 2 or more. A streak of 0 or 1 renders no badge at all.
- Weekly habits never show a streak badge, regardless of check-in history.

## Acceptance criteria

- [ ] Journal chips for daily habits with a streak ≥ 2 display the streak (e.g. "🔥 3").
- [ ] Chips for the same habit show the same streak value on every day-card, not a per-date historical value.
- [ ] Chips for daily habits with a streak of 0 or 1 show no badge.
- [ ] Chips for weekly habits never show a streak badge.
- [ ] Manual browser walkthrough confirms rendering (no automated UI/component tests required per PRD).

## Blocked by

- Issue 3 (Streak service function + API surface)
