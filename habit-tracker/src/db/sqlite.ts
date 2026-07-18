// `node:sqlite` is still experimental and predates most bundlers' builtin
// module lists (Vite/vitest included), so import it via the runtime's own
// builtin registry instead of a static `import "node:sqlite"` specifier.
import type * as NodeSqlite from "node:sqlite";

export const { DatabaseSync } = process.getBuiltinModule("node:sqlite") as typeof NodeSqlite;
export type DatabaseSync = InstanceType<typeof DatabaseSync>;
