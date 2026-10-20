import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/session-cookie";

// Next.js 16 renamed "middleware" to "proxy" (official migration note:
// nextjs.org/docs/messages/middleware-to-proxy). This file is the auth
// middleware: it verifies the session JWT and protects /dashboard.
//
// NOTE: the proxy runs on the Edge Runtime, where the Node-only
// "jsonwebtoken" library cannot run. "jose" implements the exact same
// HS256 algorithm on top of Web Crypto, so tokens signed by
// jsonwebtoken (login route, Node runtime) verify here interchangeably.
const JWT_ALGORITHMS = ["HS256"] as const;

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  // Same guard as src/lib/auth.ts: refuse weak or missing secrets.
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET ausente ou curto demais (mínimo de 32 caracteres)."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      await jwtVerify(token, getSecretKey(), { algorithms: JWT_ALGORITHMS });
      return NextResponse.next();
    } catch {
      // Invalid or expired token: fall through to the redirect below.
    }
  }

  // Unauthenticated access to /dashboard lands on /login.
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
