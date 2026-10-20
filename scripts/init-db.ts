// Applies scripts/init-db.sql to db/app.db. Idempotent: safe to run on
// every start (`npm run db:push`). Runs on plain Node (>= 23) or via tsx.
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const dbDir = path.join(process.cwd(), "db");
const dbPath = path.join(dbDir, "app.db");
const sqlPath = path.join(process.cwd(), "scripts", "init-db.sql");

fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);
db.exec(fs.readFileSync(sqlPath, "utf8"));
db.close();

console.log(`[db] Schema aplicada com sucesso em ${dbPath}`);
