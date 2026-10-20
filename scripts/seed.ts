// Seeds the single test user: admin@exemplo.com.br
// The password is read from SEED_USER_PASSWORD and hashed with bcrypt
// (cost 12) at runtime — no hash is ever hardcoded or logged.
//
// Run with: `npm run seed` (Node >= 23 runs TS natively) or
// `npx tsx scripts/seed.ts` on older Node versions.
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

// Tiny .env loader so the script works without extra CLI flags.
// Real environment variables always win; then .env.local; then .env.
function loadEnvFiles(): void {
  for (const file of [".env.local", ".env"]) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) continue;
    for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const key = match[1];
      let value = match[2];
      if (/^(["'])(.*)\1$/.test(value)) {
        value = value.slice(1, -1);
      }
      process.env[key] ??= value;
    }
  }
}

loadEnvFiles();

const SEED_EMAIL = "admin@exemplo.com.br";
const BCRYPT_COST = 12;

const password = process.env.SEED_USER_PASSWORD;
if (!password) {
  console.error(
    "[seed] Variável SEED_USER_PASSWORD não definida. Copie .env.example para .env.local e informe uma senha forte."
  );
  process.exit(1);
}
if (password.length < 8) {
  console.error("[seed] SEED_USER_PASSWORD deve ter ao menos 8 caracteres.");
  process.exit(1);
}

const dbDir = path.join(process.cwd(), "db");
const dbPath = path.join(dbDir, "app.db");
fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);
// Keep schema and seed in one reproducible step.
db.exec(
  fs.readFileSync(path.join(process.cwd(), "scripts", "init-db.sql"), "utf8")
);

// bcrypt hash generated at runtime (cost 12), never stored in the repo.
const passwordHash = bcrypt.hashSync(password, BCRYPT_COST);

// Parameterized upsert: re-running the seed refreshes the password hash.
const upsertUser = db.prepare(
  `INSERT INTO users (email, password_hash)
   VALUES (?, ?)
   ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash`
);
upsertUser.run(SEED_EMAIL, passwordHash);
db.close();

console.log(`[seed] Usuário de teste pronto: ${SEED_EMAIL}`);
