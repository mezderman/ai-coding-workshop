import type { DatabaseSync } from "@/db/sqlite";
import { toIsoDate } from "@/lib/date";

export type Habit = { id: number; name: string; frequency: "daily" | "weekly"; created_at: string };
export type CheckIn = { id: number; habit_id: number; date: string };
export type CheckInWithHabit = CheckIn & { habitName: string };

export function listHabits(db: DatabaseSync): Habit[] {
  return db.prepare("SELECT * FROM habits ORDER BY id").all() as Habit[];
}

export function createHabit(
  db: DatabaseSync,
  input: { name: string; frequency?: "daily" | "weekly" }
): Habit {
  const frequency = input.frequency ?? "daily";
  const result = db
    .prepare("INSERT INTO habits (name, frequency) VALUES (?, ?)")
    .run(input.name, frequency);
  return db
    .prepare("SELECT * FROM habits WHERE id = ?")
    .get(result.lastInsertRowid) as Habit;
}

export function checkIn(db: DatabaseSync, habitId: number, date: string = todayIso()): CheckIn {
  const existing = db
    .prepare("SELECT * FROM check_ins WHERE habit_id = ? AND date = ?")
    .get(habitId, date) as CheckIn | undefined;

  if (existing) return existing;

  const result = db
    .prepare("INSERT INTO check_ins (habit_id, date) VALUES (?, ?)")
    .run(habitId, date);
  return db
    .prepare("SELECT * FROM check_ins WHERE id = ?")
    .get(result.lastInsertRowid) as CheckIn;
}

export function removeCheckIn(db: DatabaseSync, habitId: number, date: string): void {
  db.prepare("DELETE FROM check_ins WHERE habit_id = ? AND date = ?").run(habitId, date);
}

export function listCheckIns(db: DatabaseSync, habitId: number): CheckIn[] {
  return db
    .prepare("SELECT * FROM check_ins WHERE habit_id = ? ORDER BY date")
    .all(habitId) as CheckIn[];
}

export function listCheckInsForDate(db: DatabaseSync, date: string): CheckInWithHabit[] {
  return db
    .prepare(
      `SELECT check_ins.id, check_ins.habit_id, check_ins.date, habits.name AS habitName
       FROM check_ins
       JOIN habits ON habits.id = check_ins.habit_id
       WHERE check_ins.date = ?
       ORDER BY habits.name`
    )
    .all(date) as CheckInWithHabit[];
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export type Period = { start: string; end: string };

function daysBetween(a: string, b: string): number {
  const ms = new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime();
  return Math.round(ms / 86_400_000);
}

function addDays(iso: string, days: number): string {
  const date = new Date(iso + "T00:00:00");
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/**
 * Period boundaries since a habit's creation date, inclusive of the
 * current (in-progress) period. Daily habits get one period per calendar
 * day; weekly habits get rolling 7-day windows anchored to createdDate.
 */
export function getPeriods(
  createdDate: string,
  frequency: "daily" | "weekly",
  today: string
): Period[] {
  const elapsedDays = daysBetween(createdDate, today) + 1;

  if (frequency === "daily") {
    return Array.from({ length: elapsedDays }, (_, i) => {
      const day = addDays(createdDate, i);
      return { start: day, end: day };
    });
  }

  const periodCount = Math.ceil(elapsedDays / 7);
  return Array.from({ length: periodCount }, (_, i) => {
    const start = addDays(createdDate, i * 7);
    return { start, end: addDays(start, 6) };
  });
}

export function completionRate(
  db: DatabaseSync,
  habitId: number,
  today: string = todayIso()
): number {
  const habit = db.prepare("SELECT * FROM habits WHERE id = ?").get(habitId) as Habit;
  const createdDate = habit.created_at.slice(0, 10);
  const periods = getPeriods(createdDate, habit.frequency, today);
  const checkInDates = listCheckIns(db, habitId).map((c) => c.date);

  const completedPeriods = periods.filter((period) =>
    checkInDates.some((date) => date >= period.start && date <= period.end)
  ).length;

  return completedPeriods / periods.length;
}

export type HeatmapCell = Period & { checked: boolean };

const HEATMAP_DAYS = 7;

/**
 * Fixed 7-day rolling window (today and the 6 days before it), one cell
 * per calendar day, regardless of habit age or frequency.
 */
export function heatmapCells(
  db: DatabaseSync,
  habitId: number,
  today: string = todayIso()
): HeatmapCell[] {
  const checkInDates = new Set(listCheckIns(db, habitId).map((c) => c.date));

  return Array.from({ length: HEATMAP_DAYS }, (_, i) => {
    const day = addDays(today, i - (HEATMAP_DAYS - 1));
    return { start: day, end: day, checked: checkInDates.has(day) };
  });
}

/**
 * Consecutive-day streak walking backward from today. Daily habits only;
 * weekly habits return null. If today has no check-in yet, the streak
 * still counts through yesterday (grace period) rather than reading as broken.
 */
export function currentStreak(
  db: DatabaseSync,
  habitId: number,
  today: string = todayIso()
): number | null {
  const habit = db.prepare("SELECT * FROM habits WHERE id = ?").get(habitId) as Habit;
  if (habit.frequency !== "daily") return null;

  const checkInDates = new Set(listCheckIns(db, habitId).map((c) => c.date));

  let cursor = checkInDates.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (checkInDates.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}
