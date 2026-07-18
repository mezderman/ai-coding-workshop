import { DatabaseSync } from "./sqlite";
import { runMigrations } from "./migrate";
import { seedHabits } from "./seed";

const db = new DatabaseSync(process.env.DATABASE_PATH ?? "sqlite.db");
runMigrations(db);
seedHabits(db);

export { db };
