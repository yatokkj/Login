import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/db";
import { signSessionToken } from "@/lib/auth";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/session-cookie";
import { checkLoginRateLimit } from "@/lib/rate-limit";
import { validateEmail, validatePassword } from "@/lib/validation";

// better-sqlite3 and jsonwebtoken depend on Node APIs.
export const runtime = "nodejs";

const BCRYPT_COST = 12;
// Compare against a dummy hash when the email does not exist so response
// timing stays similar whether or not the account exists (timing-attack
// mitigation; never reveal account existence).
const DUMMY_HASH = bcrypt.hashSync("timing-attack-equalizer", BCRYPT_COST);

function getClientIp(request: Request): string {
  // Behind the gateway/proxy the client IP arrives in X-Forwarded-For
  // (first hop is the original requester).
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

interface FieldErrors {
  email: string | null;
  password: string | null;
}

export async function POST(request: Request) {
  // 1) Rate limit: 5 attempts per minute per IP.
  const ip = getClientIp(request);
  const rateLimit = checkLoginRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        message: `Muitas tentativas de login. Tente novamente em ${rateLimit.retryAfterSeconds} segundos.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  // 2) Parse the JSON body defensively.
  let body: LoginBody | null = null;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    body = null;
  }

  const emailValue = typeof body?.email === "string" ? body.email.trim() : "";
  const passwordValue = typeof body?.password === "string" ? body.password : "";

  // 3) Server-side validation mirrors the client rules.
  const emailError = validateEmail(emailValue);
  const passwordError = validatePassword(passwordValue);
  if (emailError || passwordError) {
    const errors: FieldErrors = { email: emailError, password: passwordError };
    return NextResponse.json(
      { message: "Verifique os campos informados.", errors },
      { status: 400 }
    );
  }

  // 4) Credential check. findUserByEmail uses a prepared statement
  //    (parameterized query) and bcrypt never exposes the raw password.
  const user = findUserByEmail(emailValue);
  const passwordMatches = await bcrypt.compare(
    passwordValue,
    user?.password_hash ?? DUMMY_HASH
  );

  if (!user || !passwordMatches) {
    // Generic message: never reveal whether the email exists.
    return NextResponse.json(
      { message: "E-mail ou senha inválidos." },
      { status: 401 }
    );
  }

  // 5) Issue the 1-hour JWT in an httpOnly cookie. httpOnly keeps the token
  //    out of JavaScript reach; SameSite=Strict blocks cross-site sending;
  //    Secure is enabled in production (HTTPS only).
  const token = signSessionToken(user.email);
  const response = NextResponse.json(
    { message: "Login realizado com sucesso." },
    { status: 200 }
  );
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
