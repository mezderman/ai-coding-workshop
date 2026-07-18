import { describe, it, expect } from "vitest";
import { DatabaseSync } from "@/db/sqlite";
import { runMigrations } from "@/db/migrate";
import { seedHabits, DEFAULT_HABITS } from "@/db/seed";
import { listHabits } from "@/services/habitService";

function makeTestDb() {
  const db = new DatabaseSync(":memory:");
  runMigrations(db);
  return db;
}

describe("seedHabits", () => {
  it("inserts the default habits into an empty database", () => {
    const db = makeTestDb();
    seedHabits(db);
    expect(listHabits(db).map((h) => h.name)).toEqual(DEFAULT_HABITS);
  });

  it("does not duplicate habits if some already exist", () => {
    const db = makeTestDb();
    seedHabits(db);
    seedHabits(db);
    expect(listHabits(db)).toHaveLength(DEFAULT_HABITS.length);
  });
});
