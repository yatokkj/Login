import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session-cookie";

// Entry route: authenticated visitors go straight to /dashboard,
// everyone else lands on /login.
export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token && verifySessionToken(token)) {
    redirect("/dashboard");
  }
  redirect("/login");
}
