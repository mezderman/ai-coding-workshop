# Add-activity picker streak text

## Parent

PRD-streaks.md (Habit Streaks)

## What to build

Show the streak in the add-activity dropdown, using the per-habit streak now returned by `GET /api/habits` (see Issue 3). This is UI-only — the journal page's add-activity picker (`src/app/page.tsx`) is a thin consumer of the already-computed streak value.

- The native `<select>` used to log a new check-in includes the streak as plain text appended to the option label (e.g. "Reading (🔥 3)"), since native `<option>` elements can't render styled badges.
- The streak text only appears once the streak reaches 2 or more. A streak of 0 or 1 shows no streak text in the label.
- Weekly habits never show streak text in the picker, regardless of check-in history.

## Acceptance criteria

- [ ] Add-activity `<option>` labels for daily habits with a streak ≥ 2 append the streak as plain text (e.g. "Reading (🔥 3)").
- [ ] Options for daily habits with a streak of 0 or 1 show only the habit name, no streak text.
- [ ] Options for weekly habits never show streak text.
- [ ] Manual browser walkthrough confirms rendering (no automated UI/component tests required per PRD).

## Blocked by

- Issue 3 (Streak service function + API surface)
