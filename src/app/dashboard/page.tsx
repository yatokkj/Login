import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Clock3, Fingerprint, Mail, ShieldCheck } from "lucide-react";
import { verifySessionToken } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session-cookie";
import { LiquidBackground } from "@/components/liquid/LiquidBackground";
import { GlassPanel } from "@/components/liquid/GlassPanel";
import { LogoutButton } from "@/components/liquid/LogoutButton";
import { SessionExpiry } from "@/components/liquid/SessionExpiry";

export const metadata: Metadata = {
  title: "Painel · GlassID",
  description: "Painel do portal corporativo GlassID.",
};

export default async function DashboardPage() {
  // Defense in depth: the proxy already guards /dashboard, but the page
  // re-verifies the session before rendering anything sensitive.
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? verifySessionToken(token) : null;
  if (!session) {
    redirect("/login");
  }

  const avatarInitial = session.email.charAt(0).toUpperCase();

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      <LiquidBackground />
      <GlassPanel className="w-full max-w-xl p-7 pb-10 sm:p-9 sm:pb-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="glass-avatar" aria-hidden="true">
              {avatarInitial}
            </span>
            <div className="min-w-0">
              <p
                className="truncate text-sm font-semibold sm:text-base"
                style={{ color: "var(--glass-ink)" }}
              >
                {session.email}
              </p>
              <p
                className="text-xs sm:text-sm"
                style={{ color: "var(--glass-ink-muted)" }}
              >
                Sessão autenticada
              </p>
            </div>
          </div>
          <LogoutButton />
        </header>

        <div className="mt-8">
          <h1
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
            style={{ color: "var(--glass-ink)" }}
          >
            Bem-vindo(a)!
          </h1>
          <p
            className="mt-1.5 text-sm sm:text-base"
            style={{ color: "var(--glass-ink-muted)" }}
          >
            Você entrou no portal corporativo GlassID com sucesso.
          </p>
        </div>

        <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="glass-tile flex items-start gap-3 p-4">
            <Mail
              className="mt-0.5 h-5 w-5 shrink-0"
              style={{ color: "var(--glass-accent)" }}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <dt
                className="text-xs font-medium"
                style={{ color: "var(--glass-ink-muted)" }}
              >
                Conta
              </dt>
              <dd
                className="mt-1 truncate text-sm font-semibold"
                style={{ color: "var(--glass-ink)" }}
                title={session.email}
              >
                {session.email}
              </dd>
            </div>
          </div>
          <div className="glass-tile flex items-start gap-3 p-4">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 shrink-0"
              style={{ color: "var(--glass-accent)" }}
              aria-hidden="true"
            />
            <div>
              <dt
                className="text-xs font-medium"
                style={{ color: "var(--glass-ink-muted)" }}
              >
                Autenticação
              </dt>
              <dd
                className="mt-1 text-sm font-semibold"
                style={{ color: "var(--glass-ink)" }}
              >
                JWT · cookie httpOnly
              </dd>
            </div>
          </div>
          <div className="glass-tile flex items-start gap-3 p-4">
            <Clock3
              className="mt-0.5 h-5 w-5 shrink-0"
              style={{ color: "var(--glass-accent)" }}
              aria-hidden="true"
            />
            <div>
              <dt
                className="text-xs font-medium"
                style={{ color: "var(--glass-ink-muted)" }}
              >
                Sessão expira em
              </dt>
              <dd
                className="mt-1 text-sm font-semibold"
                style={{ color: "var(--glass-ink)" }}
              >
                <SessionExpiry expiresAt={session.expiresAt} />
              </dd>
            </div>
          </div>
        </dl>

        <p
          className="mt-8 flex items-center gap-1.5 text-xs"
          style={{ color: "var(--glass-ink-muted)" }}
        >
          <Fingerprint className="h-3.5 w-3.5" aria-hidden="true" />
          Ambiente corporativo seguro · GlassID
        </p>
      </GlassPanel>
    </main>
  );
}
