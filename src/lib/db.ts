import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import pkg from "../../package.json";
import type { DB } from "./db-types";

const DB_PATH = join(process.cwd(), "data", "frost.db");

if (!existsSync(join(process.cwd(), "data"))) {
  mkdirSync(join(process.cwd(), "data"), { recursive: true });
}

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = new Kysely<DB>({
  dialect: new SqliteDialect({ database: sqlite }),
});

function runMigrations() {
  const schemaDir = join(process.cwd(), "schema");
  if (!existsSync(schemaDir)) {
    return;
  }

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at INTEGER NOT NULL
    )
  `);

  const migrationFiles = readdirSync(schemaDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const applied = sqlite
    .prepare("SELECT name FROM _migrations")
    .all() as Array<{ name: string }>;
  const appliedSet = new Set(applied.map((r) => r.name));

  const hasExistingDb = sqlite
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='projects'",
    )
    .get();

  if (hasExistingDb && appliedSet.size === 0) {
    const now = Date.now();
    const insert = sqlite.prepare(
      "INSERT INTO _migrations (name, applied_at) VALUES (?, ?)",
    );
    for (const file of migrationFiles) {
      insert.run(file, now);
    }
    console.log(`Bootstrapped ${migrationFiles.length} existing migrations`);
    return;
  }

  for (const file of migrationFiles) {
    if (appliedSet.has(file)) {
      continue;
    }

    const filePath = join(schemaDir, file);
    const sql = readFileSync(filePath, "utf-8");

    sqlite.exec("BEGIN TRANSACTION");
    try {
      sqlite.exec(sql);
      sqlite
        .prepare("INSERT INTO _migrations (name, applied_at) VALUES (?, ?)")
        .run(file, Date.now());
      sqlite.exec("COMMIT");
      console.log(`Applied migration: ${file}`);
    } catch (err) {
      sqlite.exec("ROLLBACK");
      throw err;
    }
  }

  sqlite
    .prepare(
      "INSERT INTO settings (key, value) VALUES ('frost_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .run(pkg.version);
}

runMigrations();
