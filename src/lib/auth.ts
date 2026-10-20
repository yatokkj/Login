import jwt, { type JwtPayload } from "jsonwebtoken";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/session-cookie";

export interface SessionPayload {
  email: string;
  /** Expiry in milliseconds since the Unix epoch. */
  expiresAt: number;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  // Refuse weak or missing secrets at runtime instead of failing silently
  // (a guessable secret would allow forging session tokens).
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET ausente ou curto demais (mínimo de 32 caracteres)."
    );
  }
  return secret;
}

/** Signs a 1-hour HS256 session JWT with the user email as the subject. */
export function signSessionToken(email: string): string {
  return jwt.sign({ sub: email }, getJwtSecret(), {
    expiresIn: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Verifies signature and expiry. Returns null for any invalid token —
 * callers never need to distinguish failure reasons.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === "string") return null;
    const payload = decoded as JwtPayload;
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") {
      return null;
    }
    return { email: payload.sub, expiresAt: payload.exp * 1000 };
  } catch {
    return null;
  }
}
