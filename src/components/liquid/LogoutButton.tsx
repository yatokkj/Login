"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      // The server clears the httpOnly cookie; no token ever touches JS.
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch {
      // Network hiccup: re-enable the button so the user can retry.
      setIsLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      className="glass-button glass-button--ghost"
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Saindo…
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sair
        </>
      )}
    </button>
  );
}
