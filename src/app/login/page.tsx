import type { Metadata } from "next";
import { LiquidBackground } from "@/components/liquid/LiquidBackground";
import { GlassPanel } from "@/components/liquid/GlassPanel";
import { LoginForm } from "@/components/liquid/LoginForm";

export const metadata: Metadata = {
  title: "Entrar · GlassID",
  description: "Acesse o portal corporativo GlassID.",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      <LiquidBackground />
      <GlassPanel className="w-full max-w-md p-7 pb-10 sm:p-9 sm:pb-12">
        <LoginForm />
      </GlassPanel>
    </main>
  );
}
