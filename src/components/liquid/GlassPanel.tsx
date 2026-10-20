import type { ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

/**
 * Liquid-glass container shaped with very large rounded corners plus a
 * bottom tab (speech-bubble silhouette from the reference). The sheen and
 * the tab are drawn by pseudo-elements in globals.css, so the DOM stays
 * clean and semantic.
 */
export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <section className={`glass-panel ${className ?? ""}`.trim()}>
      {children}
    </section>
  );
}
