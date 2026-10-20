import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-cookie";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json(
    { message: "Sessão encerrada com sucesso." },
    { status: 200 }
  );
  // Clear the cookie by expiring it immediately, reusing the same attributes
  // (path/sameSite/secure) used when it was set, so browsers honor it.
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
