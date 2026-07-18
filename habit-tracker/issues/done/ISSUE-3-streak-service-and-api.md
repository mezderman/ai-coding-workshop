# Streak service function + API surface

## Parent

PRD-streaks.md (Habit Streaks)

## What to build

Add a streak calculation to the service layer, following the same module/style conventions as the existing habit/check-in functions in `src/services/habitService.ts` (pure function, takes the DB handle plus habit id, derives its result at read time from the `check_ins` table — no new column, no schema migration, no cache).

Streak rules:

- Applies only to habits with `frequency: "daily"`. Weekly habits are not applicable — the function returns null/undefined for them, never a number (including never 0).
- A streak is the number of consecutive calendar days, walking backward from today, that have a check-in for that habit. The chain breaks at the first gap encountered.
- Grace period: if yesterday has a check-in but today does not yet, the streak counts through yesterday and displays as still active — it only reads as broken once a full day has passed with no check-in.

Extend the habits-listing API response (`GET /api/habits`, currently `listHabits(db)` in `src/app/api/habits/route.ts`) so each daily habit in the response includes its current streak, computed server-side via the new service function. No new endpoint.

## Acceptance criteria

- [ ] A new service-layer function computes a habit's current streak from its check-in dates and a reference "today," matching the consecutive-day + grace-period rule above.
- [ ] For weekly-frequency habits, the function returns not-applicable (null/undefined), never a numeric streak.
- [ ] `GET /api/habits` includes each daily habit's current streak in its response.
- [ ] Unit tests (same style/location as `tests/habitService.test.ts`, run against an in-memory SQLite DB) cover:
  - [ ] No check-ins at all → no streak / not shown.
  - [ ] Check-ins on today, yesterday, and the day before → correct consecutive count.
  - [ ] A gap two or more days back → streak stops counting at the gap.
  - [ ] Check-in on yesterday only, nothing yet today (grace period) → streak counts through yesterday as still active.
  - [ ] A weekly-frequency habit with a run of daily check-ins → returns not-applicable, not a number.

## Blocked by

None - can start immediately
