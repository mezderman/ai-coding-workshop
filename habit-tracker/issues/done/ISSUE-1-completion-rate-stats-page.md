# Completion rate: service + API + stats page

## Parent

PRD-stats.md (Habit Stats & Analytics)

## What to build

Add a per-habit completion-rate calculation to the service layer, following the same module/style conventions as the existing habit/check-in functions (`src/services/habitService.ts`). This includes a shared "period" helper that both this slice and the follow-up heatmap slice will reuse:

- For daily habits, a period is a calendar day.
- For weekly habits, a period is a rolling 7-day window anchored to the habit's creation date (day 0–6 = period 1, day 7–13 = period 2, etc.) — not calendar (Mon–Sun) weeks.
- The current in-progress period (today, or this week's rolling window) always counts in the denominator, even though it isn't finished yet.
- Completion rate = periods with ≥1 check-in / total periods elapsed since the habit's creation date, inclusive of the current period.

Add a new API route that returns this computed completion rate for a given habit (a new per-habit stats endpoint — no existing route currently exposes this).

Add the app's first real navigation: a sidebar with "Journal" and "Stats" links (today's sidebar in `AppShell.tsx` is brand-only, no links). Add a new `/stats` page that renders one card per habit, each showing that habit's completion rate. This is a full vertical slice and should be demoable/verifiable on its own once merged, even without the heatmap (Issue 4).

## Acceptance criteria

- [ ] A shared period-boundary helper in the service layer computes daily periods (calendar days) and weekly periods (rolling 7-day windows anchored to creation date).
- [ ] A new service-layer function computes completion rate for a given habit from its creation date, frequency, and check-in dates.
- [ ] The current (in-progress) period always counts in the denominator.
- [ ] A new per-habit stats API route returns the computed completion rate.
- [ ] Sidebar navigation now shows "Journal" and "Stats" links.
- [ ] A new `/stats` page renders one card per habit, showing that habit's completion rate — a separate breakdown per habit, not one blended number.
- [ ] Unit tests (in the same style/location as `tests/habitService.test.ts`, run against an in-memory SQLite DB) cover: a daily habit's completion rate including today in the denominator with a partial check-in history; a weekly habit's completion rate over rolling periods including a partial current period; a brand-new habit (created today, no check-ins) produces a sane, non-crashing result.

## Blocked by

None - can start immediately
