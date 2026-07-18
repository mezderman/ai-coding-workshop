import { describe, it, expect, beforeEach } from "vitest";
import { DatabaseSync } from "@/db/sqlite";
import { runMigrations } from "@/db/migrate";
import {
  createHabit,
  checkIn,
  listCheckIns,
  listCheckInsForDate,
  removeCheckIn,
  listHabits,
  completionRate,
  heatmapCells,
  currentStreak,
} from "@/services/habitService";

function makeTestDb() {
  const db = new DatabaseSync(":memory:");
  runMigrations(db);
  return db;
}

function setCreatedAt(db: DatabaseSync, habitId: number, date: string) {
  db.prepare("UPDATE habits SET created_at = ? WHERE id = ?").run(date, habitId);
}

describe("habitService", () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = makeTestDb();
  });

  it("creates a habit with a default daily frequency", () => {
    const habit = createHabit(db, { name: "Read" });
    expect(habit.name).toBe("Read");
    expect(habit.frequency).toBe("daily");
  });

  it("lists created habits", () => {
    createHabit(db, { name: "Read" });
    createHabit(db, { name: "Exercise" });
    expect(listHabits(db)).toHaveLength(2);
  });

  it("records a check-in for a given date", () => {
    const habit = createHabit(db, { name: "Read" });
    checkIn(db, habit.id, "2026-07-09");
    expect(listCheckIns(db, habit.id)).toHaveLength(1);
  });

  it("does not double check-in on the same day", () => {
    const habit = createHabit(db, { name: "Read" });
    checkIn(db, habit.id, "2026-07-09");
    checkIn(db, habit.id, "2026-07-09");
    expect(listCheckIns(db, habit.id)).toHaveLength(1);
  });

  it("lists check-ins for a specific date across habits, with habit names", () => {
    const reading = createHabit(db, { name: "Read" });
    const exercise = createHabit(db, { name: "Exercise" });
    checkIn(db, reading.id, "2026-07-09");
    checkIn(db, exercise.id, "2026-07-09");
    checkIn(db, reading.id, "2026-07-10");

    const entries = listCheckInsForDate(db, "2026-07-09");
    expect(entries).toHaveLength(2);
    expect(entries.map((e) => e.habitName).sort()).toEqual(["Exercise", "Read"]);
  });

  it("returns no entries for a date with no check-ins", () => {
    createHabit(db, { name: "Read" });
    expect(listCheckInsForDate(db, "2026-01-01")).toHaveLength(0);
  });

  it("removes a check-in for a habit on a given date", () => {
    const habit = createHabit(db, { name: "Read" });
    checkIn(db, habit.id, "2026-07-09");
    removeCheckIn(db, habit.id, "2026-07-09");
    expect(listCheckIns(db, habit.id)).toHaveLength(0);
  });

  it("removing a check-in only affects that habit and date", () => {
    const reading = createHabit(db, { name: "Read" });
    const exercise = createHabit(db, { name: "Exercise" });
    checkIn(db, reading.id, "2026-07-09");
    checkIn(db, exercise.id, "2026-07-09");

    removeCheckIn(db, reading.id, "2026-07-09");

    expect(listCheckIns(db, reading.id)).toHaveLength(0);
    expect(listCheckIns(db, exercise.id)).toHaveLength(1);
  });

  describe("completionRate", () => {
    it("includes today in the denominator for a daily habit with partial history", () => {
      const habit = createHabit(db, { name: "Read" });
      setCreatedAt(db, habit.id, "2026-07-01");
      checkIn(db, habit.id, "2026-07-01");
      checkIn(db, habit.id, "2026-07-03");

      // created 2026-07-01, "today" 2026-07-05 -> 5 daily periods, 2 checked
      const rate = completionRate(db, habit.id, "2026-07-05");
      expect(rate).toBeCloseTo(2 / 5);
    });

    it("computes rolling 7-day periods for a weekly habit, including a partial current period", () => {
      const habit = createHabit(db, { name: "Exercise", frequency: "weekly" });
      setCreatedAt(db, habit.id, "2026-07-01");
      checkIn(db, habit.id, "2026-07-02"); // period 1 (07-01..07-07)
      checkIn(db, habit.id, "2026-07-12"); // period 2 (07-08..07-14)

      // today 2026-07-16 -> day 15 elapsed -> periods: [07-01..07-07], [07-08..07-14], [07-15..07-21]
      // 3rd period is in-progress and has no check-in yet
      const rate = completionRate(db, habit.id, "2026-07-16");
      expect(rate).toBeCloseTo(2 / 3);
    });

    it("produces a sane result for a brand-new habit with no check-ins", () => {
      const habit = createHabit(db, { name: "Read" });
      setCreatedAt(db, habit.id, "2026-07-14");

      const rate = completionRate(db, habit.id, "2026-07-14");
      expect(rate).toBe(0);
    });
  });

  describe("heatmapCells", () => {
    it("produces one cell per calendar day for a daily habit, correctly marked", () => {
      const habit = createHabit(db, { name: "Read" });
      setCreatedAt(db, habit.id, "2026-07-01");
      checkIn(db, habit.id, "2026-07-01");
      checkIn(db, habit.id, "2026-07-03");

      const cells = heatmapCells(db, habit.id, "2026-07-05");
      expect(cells).toHaveLength(5);
      expect(cells.map((c) => c.checked)).toEqual([true, false, true, false, false]);
      expect(cells[0].start).toBe("2026-07-01");
      expect(cells[0].end).toBe("2026-07-01");
    });

    it("produces one cell per rolling period for a weekly habit, correctly marked", () => {
      const habit = createHabit(db, { name: "Exercise", frequency: "weekly" });
      setCreatedAt(db, habit.id, "2026-07-01");
      checkIn(db, habit.id, "2026-07-02"); // period 1 (07-01..07-07)
      checkIn(db, habit.id, "2026-07-12"); // period 2 (07-08..07-14)

      const cells = heatmapCells(db, habit.id, "2026-07-16");
      expect(cells).toHaveLength(3);
      expect(cells.map((c) => c.checked)).toEqual([true, true, false]);
      expect(cells[1]).toEqual({ start: "2026-07-08", end: "2026-07-14", checked: true });
    });

    it("produces a single unchecked cell for a brand-new habit with no check-ins", () => {
      const habit = createHabit(db, { name: "Read" });
      setCreatedAt(db, habit.id, "2026-07-14");

      const cells = heatmapCells(db, habit.id, "2026-07-14");
      expect(cells).toEqual([{ start: "2026-07-14", end: "2026-07-14", checked: false }]);
    });
  });

  describe("currentStreak", () => {
    it("returns 0 for a daily habit with no check-ins", () => {
      const habit = createHabit(db, { name: "Read" });
      setCreatedAt(db, habit.id, "2026-07-01");
      expect(currentStreak(db, habit.id, "2026-07-14")).toBe(0);
    });

    it("counts consecutive check-ins on today, yesterday, and the day before", () => {
      const habit = createHabit(db, { name: "Read" });
      setCreatedAt(db, habit.id, "2026-07-01");
      checkIn(db, habit.id, "2026-07-12");
      checkIn(db, habit.id, "2026-07-13");
      checkIn(db, habit.id, "2026-07-14");
      expect(currentStreak(db, habit.id, "2026-07-14")).toBe(3);
    });

    it("stops counting at a gap two or more days back", () => {
      const habit = createHabit(db, { name: "Read" });
      setCreatedAt(db, habit.id, "2026-07-01");
      checkIn(db, habit.id, "2026-07-10");
      checkIn(db, habit.id, "2026-07-13");
      checkIn(db, habit.id, "2026-07-14");
      expect(currentStreak(db, habit.id, "2026-07-14")).toBe(2);
    });

    it("grace period: counts through yesterday when today has no check-in yet", () => {
      const habit = createHabit(db, { name: "Read" });
      setCreatedAt(db, habit.id, "2026-07-01");
      checkIn(db, habit.id, "2026-07-12");
      checkIn(db, habit.id, "2026-07-13");
      expect(currentStreak(db, habit.id, "2026-07-14")).toBe(2);
    });

    it("returns null for a weekly habit, never a numeric streak", () => {
      const habit = createHabit(db, { name: "Exercise", frequency: "weekly" });
      setCreatedAt(db, habit.id, "2026-07-01");
      checkIn(db, habit.id, "2026-07-12");
      checkIn(db, habit.id, "2026-07-13");
      checkIn(db, habit.id, "2026-07-14");
      expect(currentStreak(db, habit.id, "2026-07-14")).toBeNull();
    });
  });
});
