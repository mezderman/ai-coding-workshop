import type { DatabaseSync } from "./sqlite";

export const DEFAULT_HABITS = [
  "Read",
  "Exercise",
  "Meditate",
  "Drink Water",
  "Sleep 8 Hours",
  "Stretch",
  "Eat Vegetables",
  "No Sugar",
  "Walk Outside",
  "Practice Gratitude",
];

export function seedHabits(db: DatabaseSync): void {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM habits").get() as { count: number };
  if (count > 0) return;

  const insert = db.prepare("INSERT INTO habits (name, frequency) VALUES (?, 'daily')");
  for (const name of DEFAULT_HABITS) {
    insert.run(name);
  }
}
