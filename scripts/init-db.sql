-- GlassID — users table.
-- Applied idempotently by `npm run db:push` (scripts/init-db.ts).

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
