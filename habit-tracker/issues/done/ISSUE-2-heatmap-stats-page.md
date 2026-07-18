# Calendar heatmap on stats page

## Parent

PRD-stats.md (Habit Stats & Analytics)

## What to build

Add a heatmap-cell calculation to the service layer, reusing the same period-boundary helper introduced in Issue 3 (calendar days for daily habits, rolling 7-day windows anchored to creation date for weekly habits). For a given habit, this produces one cell per period since the habit's creation date — no fixed trailing window (e.g. no 90-day cap); long-running habits show their full history. A cell is "checked" if its period contains at least one check-in.

Extend the per-habit stats API route (added in Issue 3) to also return this array of heatmap cells (each cell identifying its period — a date for daily habits, a period start/end for weekly habits — and whether it was checked).

Extend each habit's card on the `/stats` page (added in Issue 3) to render its heatmap: a lightweight custom CSS-grid component (GitHub-contributions-style), not a charting library — none exists in this project and none is needed here.

## Acceptance criteria

- [ ] A new service-layer function computes heatmap cells for a given habit, reusing the period helper from Issue 3.
- [ ] Daily habits produce one cell per calendar day since creation; weekly habits produce one cell per rolling 7-day period since creation.
- [ ] Heatmap covers full history since the habit's creation date, with no fixed trailing-window cap.
- [ ] The stats API route's response now includes the heatmap-cells array alongside the completion rate.
- [ ] Each habit's card on the `/stats` page renders its own heatmap via a custom CSS-grid component (no charting library dependency added).
- [ ] Unit tests (same style/location as `tests/habitService.test.ts`) cover: a daily habit's heatmap has one cell per calendar day, correctly marked checked/unchecked; a weekly habit's heatmap has one cell per rolling period, correctly marked based on any check-in falling in that period; a brand-new habit (created today, no check-ins) produces a sane single-cell result.
- [ ] Manually verified in the browser: each habit's card shows a heatmap reflecting its actual check-in history.

## Blocked by

- Issue 3: Completion rate service + API + stats page
