# PRD: Habit Stats & Analytics

## Problem Statement

Once a user checks in on a habit for a while, that history disappears into the journal's rolling window with no way to look back and see how they've actually done. There's no answer to "how consistent have I been with this?" or "which habits am I actually slacking on?" — the data exists, but nothing surfaces it, so users get no sense of progress or accomplishment from the history they've already built up.

## Solution

Add a dedicated stats view, reachable from a new sidebar nav link, showing a per-habit breakdown of two things: a completion rate (how consistently the habit has been checked in on, relative to how long it's existed) and a calendar heatmap (a visual, at-a-glance history of check-in activity). This gives users a lightweight, visual answer to "how am I doing?" without building a full analytics/BI surface.

## User Stories

1. As a user, I want to see a completion rate for each of my habits, so that I know how consistently I've actually kept up with it.
2. As a user with a daily habit, I want completion rate calculated from the days elapsed since I created the habit, so that the number reflects my real lifetime performance rather than an arbitrary recent window.
3. As a user with a weekly habit, I want completion rate calculated using weeks (not days) elapsed since I created it, so that the rate is fair to a habit I only intend to do once a week.
4. As a user checking my stats today (before checking in yet), I want today (or the current in-progress week) to still count toward the denominator, so that the calculation logic stays simple and consistent with how streaks already treat "today."
5. As a user, I want a calendar heatmap showing my check-in history for each habit, so that I can visually see patterns and consistency over time at a glance.
6. As a user with a daily habit, I want the heatmap to show one cell per day, so that I can see exactly which days I did or didn't check in.
7. As a user with a weekly habit, I want the heatmap to show one cell per rolling week (not sparse daily dots), so that the visualization doesn't look broken or mostly empty for something I only do once a week.
8. As a user, I want the heatmap to cover a habit's full history since creation (not just a recent window), so that long-running habits show their entire journey.
9. As a user with multiple habits, I want a separate completion-rate-and-heatmap breakdown per habit (not one blended number across all habits), so that I can tell which specific habits I'm doing well or poorly on.
10. As a user, I want a "Stats" link in the app's navigation, so that I can get to this view without it being crammed into the journal page.
11. As a developer, I want the completion-rate and heatmap-cell calculations isolated in tested service-layer functions, so that the logic is verified independently of the UI and can be reused later (e.g. when a "best-ever streak" stat is added once the streak feature exists).

## Implementation Decisions

- **Scope for this iteration**: completion rate and calendar heatmap only. "Best-ever streak" (also mentioned in the original ask) is explicitly deferred — it depends on streak-history logic, and the underlying streak feature (from the separate streak PRD) has not yet been implemented in this codebase. Building streak-derived stats now would risk a second, inconsistent implementation of streak logic later.
- **Breakdown**: per-habit, not a single combined/blended view. Each habit gets its own completion rate and its own heatmap.
- **Completion rate formula — daily habits**: `(days with ≥1 check-in) / (days elapsed since the habit's creation date, inclusive of today)`. The current day counts in the denominator even though it isn't finished yet.
- **Completion rate formula — weekly habits**: same idea, but using rolling 7-day periods anchored to the habit's creation date instead of calendar (Mon–Sun) weeks. Week 1 = creation date through day 6, week 2 = day 7 through day 13, and so on. The current in-progress rolling week counts in the denominator. A week "counts" toward the numerator if it contains at least one check-in.
- **Heatmap granularity**: daily habits render one cell per calendar day. Weekly habits render one cell per rolling 7-day period (same period boundaries as the completion-rate calculation), lit if that period contains at least one check-in. This keeps the two calculations — rate and heatmap — using the same underlying period logic for weekly habits.
- **Heatmap range**: full history since the habit's creation date — no fixed trailing window (e.g. no cap at 90 days). Long-running habits show their entire history.
- **Heatmap build approach**: a lightweight custom component (CSS-grid of colored day/period cells, in the style of a GitHub-contributions-style graph) rather than pulling in a charting library. No charting/visualization dependency currently exists in the project and none is needed for this.
- **Architecture — service layer**: new service-layer function(s), following the same module/style conventions as the existing habit/check-in functions, to compute (a) completion rate and (b) heatmap cell data for a given habit. These are pure derivations over the existing check-ins data — no schema changes, no new columns, no stored/cached values.
- **Architecture — API**: a new API route (per-habit stats) that calls the new service function(s) and returns completion rate plus an array of heatmap cells (each cell identifying its period — a date for daily habits, a period start/end for weekly habits — and whether it was "checked"). No existing route currently exposes this.
- **Architecture — UI/navigation**: this is the first real navigation in the app (today's sidebar is brand-only, no links). Add a "Stats" nav link alongside a link to the existing journal view, and a new page that renders one card per habit with its completion rate and heatmap.

## Testing Decisions

- Good tests here exercise the new service functions' external behavior (given a habit's creation date, frequency, and set of stored check-in dates, what completion rate and heatmap cells come back) rather than internal implementation details of the date-math.
- **Seam**: the service layer is the single test seam, matching the existing pattern in `tests/habitService.test.ts` — tests run against a real in-memory SQLite database (not mocks), calling the new service function(s) directly. The new API route and the `/stats` page UI are thin consumers and are not independently tested; a manual browser walkthrough covers UI rendering.
- Required test cases:
  1. Daily habit: completion rate correctly includes today in the denominator, with a partial check-in history producing the expected fraction.
  2. Weekly habit: completion rate correctly computed over rolling 7-day periods anchored to creation date, including a partial (in-progress) current period in the denominator.
  3. Daily habit: heatmap returns one cell per calendar day since creation, correctly marked checked/unchecked.
  4. Weekly habit: heatmap returns one cell per rolling 7-day period since creation, correctly marked checked/unchecked based on whether any check-in falls in that period.
  5. A brand-new habit (created today, no check-ins yet) produces a sane result (non-crashing, correct single-period denominator) for both rate and heatmap.

## Out of Scope

- "Best-ever streak" or any other streak-derived stat — deferred until the streak feature itself is built.
- A combined/blended stats view across all habits.
- Any fixed trailing-window heatmap (e.g. last 90 days) — full history only.
- Charting library adoption — heatmap is a custom lightweight component.
- Calendar-week (Mon–Sun) semantics for weekly habits — rolling periods from creation date only.
- Export, sharing, or comparison of stats between habits or users.
- Authentication, multi-user support (app remains single-user/local).
- Automated UI/component-level tests.

## Further Notes

This feature reuses the same architectural pattern established for streaks (service-layer function → API field/route → thin UI consumer, tested at the service seam). Once the streak feature is actually implemented, a natural follow-up PRD would add "best-ever streak" to this stats view using the same seam.
