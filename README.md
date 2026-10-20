# GlassID — Liquid Glass Login (pt-BR)

A corporate login system with an iOS-inspired **Liquid Glass** interface: animated
fluid gradient blobs (blue, cyan, purple, green), a frosted speech-bubble panel
(very large rounded corners + bottom tab), refraction-style hover/focus effects,
and full accessibility fallbacks (`prefers-reduced-motion`, no-`backdrop-filter`).

All user-facing text is in **Brazilian Portuguese**; all code, identifiers and
comments are in English.

## Stack

| Layer     | Technology                                                      |
| --------- | --------------------------------------------------------------- |
| Frontend  | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 |
| Backend   | Next.js Route Handlers (Node runtime)                            |
| Database  | SQLite via better-sqlite3 (prepared statements only)             |
| Security  | bcryptjs (cost 12) · jsonwebtoken (HS256, 1 h) · jose (edge)     |

## File tree (project-specific files)

```
├── .env.example                  # JWT_SECRET + SEED_USER_PASSWORD template
├── next.config.ts                # serverExternalPackages: better-sqlite3
├── package.json                  # db:push / seed scripts
├── proxy.ts  →  src/proxy.ts     # auth middleware (Next 16 renamed middleware → proxy)
├── scripts/
│   ├── init-db.sql               # CREATE TABLE users (...)
│   ├── init-db.ts                # applies the SQL (npm run db:push)
│   └── seed.ts                   # seeds admin@exemplo.com.br (npm run seed)
└── src/
    ├── app/
    │   ├── globals.css           # Liquid Glass design system + animations
    │   ├── layout.tsx            # <html lang="pt-BR">
    │   ├── page.tsx              # entry redirect (login ⇄ dashboard)
    │   ├── login/page.tsx        # login page
    │   ├── dashboard/page.tsx    # protected dashboard (welcome + logout)
    │   └── api/auth/
    │       ├── login/route.ts    # POST — validation, bcrypt, JWT, rate limit
    │       └── logout/route.ts   # POST — clears the session cookie
    ├── components/liquid/
    │   ├── LiquidBackground.tsx  # animated gradient blobs
    │   ├── GlassPanel.tsx        # speech-bubble glass container
    │   ├── LoginForm.tsx         # form, inline pt-BR errors, loading state
    │   ├── PasswordField.tsx     # password input + show/hide toggle
    │   ├── LogoutButton.tsx
    │   └── SessionExpiry.tsx     # pt-BR expiry time in the user's timezone
    └── lib/
        ├── db.ts                 # better-sqlite3 singleton + parameterized query
        ├── auth.ts               # JWT sign/verify (jsonwebtoken)
        ├── rate-limit.ts         # 5 login attempts / minute / IP
        ├── session-cookie.ts     # cookie name + max age (runtime-agnostic)
        └── validation.ts         # shared client/server rules, pt-BR messages
```

## Run locally (step by step)

> Requirements: Node.js 23+ (runs the TS scripts natively) or Node 20+ with
> `npx tsx`. Bun also works for install/dev, but run the DB scripts with Node
> (Bun's runtime has a NAPI incompatibility with better-sqlite3).

1. **Install dependencies**

   ```bash
   npm install        # or: bun install
   ```

2. **Configure the environment**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:

   - `JWT_SECRET` — long random string, e.g. `openssl rand -hex 64` (min 32 chars).
   - `SEED_USER_PASSWORD` — the test user's password (min 8 chars).

3. **Create the database schema**

   ```bash
   npm run db:push   # node scripts/init-db.ts → db/app.db
   ```

4. **Seed the test user**

   ```bash
   npm run seed      # node scripts/seed.ts → admin@exemplo.com.br
   ```

5. **Start the dev server**

   ```bash
   npm run dev       # http://localhost:3000
   ```

6. **Test the login flow**

   - Open `http://localhost:3000` → you are redirected to `/login`.
   - Try submitting empty fields → inline pt-BR validation messages.
   - Try a wrong password → generic `"E-mail ou senha inválidos."` (the API
     never reveals whether the email exists).
   - Log in with `admin@exemplo.com.br` + your `SEED_USER_PASSWORD` → the
     dashboard loads with a welcome message and session details.
   - Click `"Sair"` → the cookie is cleared and you return to `/login`.
   - While logged out, open `http://localhost:3000/dashboard` directly → the
     auth proxy redirects you to `/login`.
   - Six rapid login attempts in one minute → HTTP 429 with the pt-BR
     rate-limit message.

   Quick API check with curl:

   ```bash
   curl -i -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@exemplo.com.br","password":"YOUR_SEED_PASSWORD"}'
   ```

## Security notes

- Passwords hashed with **bcrypt cost 12**; plaintext is never stored or logged.
- All SQL goes through **prepared statements** (parameterized queries).
- Invalid credentials return one **generic pt-BR message** for both
  "no such user" and "wrong password"; a dummy bcrypt compare keeps timing
  uniform.
- Session is a **1-hour HS256 JWT** stored in an **httpOnly, SameSite=Strict**
  cookie (`Secure` in production).
- `/dashboard` is protected by `src/proxy.ts` (Next.js 16's renamed
  middleware; `jose` verifies the token on the Edge runtime because
  `jsonwebtoken` is Node-only — same HS256 secret, interchangeable tokens).
- Login route is rate limited: **5 attempts per minute per IP** (in-memory;
  swap in Redis for multi-instance deployments).
