"use client";

import { useMemo, useSyncExternalStore } from "react";

interface SessionExpiryProps {
  /** Expiry in milliseconds since the Unix epoch. */
  expiresAt: number;
}

// No-op subscription: we only need the client/server snapshot distinction.
const subscribeToNothing = () => () => {};

/**
 * Formats the session expiry in pt-BR on the client so it renders in the
 * visitor's own timezone (server-side formatting would show UTC). The
 * useSyncExternalStore idiom is the canonical hydration-safe way to render
 * client-only values without setState-in-effect cascading renders.
 */
export function SessionExpiry({ expiresAt }: SessionExpiryProps) {
  const isClient = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );

  const formatted = useMemo(() => {
    if (!isClient) return "—";
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "medium",
      }).format(new Date(expiresAt));
    } catch {
      // Fallback if the date cannot be formatted in this browser.
      return "—";
    }
  }, [isClient, expiresAt]);

  return <time dateTime={new Date(expiresAt).toISOString()}>{formatted}</time>;
}
