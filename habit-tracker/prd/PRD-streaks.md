# PRD: Habit Streaks

## Problem Statement

Users create 2-3 habits in their first session, check in a handful of times in the first week, then stop coming back — most are gone by day 10. Checking in currently feels like a chore: logging an activity produces no feedback beyond a chip appearing in the journal. There's no sense of building momentum or of losing something by skipping a day, so there's nothing pulling a user back tomorrow.

## Solution

Show users a live streak count (consecutive days checked in) on each daily habit, visible everywhere that habit appears in the journal. Missing a day resets it to zero, so the visible number creates a reason to come back and check in again — a small, low-effort motivational layer that can be shipped fast and evaluated for impact on day-10 retention before investing in points or levels.

## User Stories

1. As a user with a daily habit I've checked in on for several consecutive days, I want to see my current streak on the habit, so that I feel a sense of accomplishment and momentum.
2. As a user who missed a day on a daily habit, I want the streak to reflect that the chain was broken, so that the counter stays honest and I'm motivated to start building it again.
3. As a user who checked in yesterday but hasn't checked in yet today, I want my streak to still show as active, so that I'm not falsely told my streak is broken before the day is even over.
4. As a user with a habit at streak 0 or 1, I want no streak badge cluttering the chip, so that the UI only surfaces the number once it's actually meaningful.
5. As a user with a weekly-frequency habit, I want no streak shown on it, so that I'm not shown a misleading or unfair daily-consecutive count for something I only intend to do once a week.
6. As a user browsing past day-cards in the journal, I want the streak shown on a habit's chip to always reflect today's current streak (not a historical snapshot for that day), so that the number is simple and consistent no matter where I see it.
7. As a user picking a habit to check in via the add-activity dropdown, I want to see the current streak next to the habit name, so that I have the same motivational cue at the moment I decide what to log.
8. As a user who deletes a check-in (e.g. logged in error), I want the streak to recalculate immediately to reflect the corrected history, so that the number stays trustworthy.
9. As a developer building on this codebase later (e.g. adding points/levels), I want streak logic isolated in a single, tested service-layer function, so that it can be reused or extended without re-deriving the rules.

## Implementation Decisions

- **Scope for this iteration**: streaks only. Points and levels (also mentioned in the original ask) are explicitly out of scope and deferred pending results of this experiment.
- **Applicability**: streaks apply only to habits with `frequency: "daily"`. Habits with `frequency: "weekly"` never show a streak value (treated as not applicable, not zero).
- **Streak definition**: the number of consecutive calendar days, walking backward from today, that have a check-in for that habit. The chain breaks at the first gap encountered.
- **Grace period for "today"**: if yesterday has a check-in but today does not yet, the streak is computed as if today were checked in (i.e., it counts through yesterday and displays as still active) — it only drops to a broken state once a full day has passed with no check-in. This avoids showing a streak as broken while the current day is still in progress.
- **Computation strategy**: streaks are derived at read time from the existing `check_ins` table — no new column, no stored/cached counter, no schema migration. A new service-layer function computes the streak for a given habit by querying its check-in dates and applying the consecutive-day/grace-period rule above. This keeps the value always correct with no sync/drift risk, acceptable given this is a single-user, local SQLite app with low query volume.
- **Service-layer interface**: one new function alongside the existing habit/check-in functions (in the same module and same style — takes the DB handle plus habit id, returns a number or null/undefined for non-applicable weekly habits). It's a pure derivation over data already fetched via existing query patterns (see `listCheckIns` for the existing style of querying check-ins for a habit).
- **API surface**: the habit-listing response (currently returned by the habits list endpoint) is extended to include each daily habit's current streak, computed server-side via the new service function. No new endpoint is introduced.
- **UI placement — journal chips**: every chip representing a logged check-in for a daily habit shows its current streak (e.g. "Reading 🔥 3"), regardless of which day-card (date) the chip is rendered under. The number shown is always the same — today's current streak — not a historical value for that specific date.
- **UI placement — add-activity picker**: the native `<select>` dropdown used to log a new check-in includes the streak as plain text appended to the option label (e.g. "Reading (🔥 3)"), since native `<option>` elements can't render styled badges.
- **Display threshold**: the streak badge/text is only shown once the streak reaches 2 or more. A streak of 0 or 1 renders no badge at all, to avoid noise immediately after a fresh or reset start.
- **Weekly habits**: never show a streak badge/text anywhere (chips or picker), regardless of check-in history.

## Testing Decisions

- Good tests here exercise the new streak service function's external behavior (given a set of stored check-in dates and a reference "today," what streak number comes back) rather than internal implementation details of how the query or loop is written.
- **Seam**: the service layer is the single test seam for this feature, matching the existing pattern in `tests/habitService.test.ts` — tests run against a real in-memory SQLite database (not mocks), calling the service function directly. The API route and React UI are thin consumers of this function and are not independently tested; a manual browser walkthrough covers the UI rendering.
- Required test cases for the streak function:
  1. No check-ins at all → no streak / not shown.
  2. Check-ins on today and yesterday (and the day before) → correct consecutive count.
  3. A gap two or more days back → streak stops counting at the gap.
  4. Check-in on yesterday only, nothing yet today (grace period case) → streak counts through yesterday as still active.
  5. A weekly-frequency habit with a run of daily check-ins → returns not-applicable (no streak), not a number.

## Out of Scope

- Points, scores, or levels of any kind.
- Any streak concept for weekly-frequency habits.
- Stored/cached streak values, schema migrations, or backfill logic.
- Historical/as-of-date streak values shown on past day-cards.
- Any analytics/instrumentation to measure retention impact — this PRD covers only the product feature, not measurement of whether it moves the needle.
- Authentication, multi-user support, or any leaderboard/social comparison feature (app remains single-user/local).
- Automated UI/component-level tests.

## Further Notes

This is intentionally the smallest slice of Priya's "motivation layer" idea, chosen to ship fast and validate whether streaks alone move day-10 retention before committing to the larger points/levels surface area. If this experiment shows a positive signal, a natural next PRD would layer in points and/or levels on top of the same service-layer seam established here.
