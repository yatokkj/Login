import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
}

const DB_DIR = path.join(process.cwd(), "db");
const DB_PATH = path.join(DB_DIR, "app.db");

// Reuse a single connection across dev-server hot reloads, the standard
// better-sqlite3 pattern for Next.js development.
const globalForSqlite = globalThis as unknown as {
  __glassSqlite?: Database.Database;
};

function createConnection(): Database.Database {
  fs.mkdirSync(DB_DIR, { recursive: true });
  const connection = new Database(DB_PATH);
  // Idempotent bootstrap mirroring scripts/init-db.sql so a fresh clone
  // always has the table, even before `npm run seed` has been executed.
  connection.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );
  `);
  return connection;
}

export function getDb(): Database.Database {
  globalForSqlite.__glassSqlite ??= createConnection();
  return globalForSqlite.__glassSqlite;
}

// Every query goes through a prepared statement: better-sqlite3 binds "?"
// placeholders with real parameterization, preventing SQL injection by
// construction.
export function findUserByEmail(email: string): UserRow | undefined {
  return getDb()
    .prepare("SELECT id, email, password_hash FROM users WHERE email = ?")
    .get(email) as UserRow | undefined;
}
