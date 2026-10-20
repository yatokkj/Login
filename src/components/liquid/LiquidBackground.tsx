// Fixed animated backdrop: deep navy base plus four slowly drifting
// gradient blobs (blue, cyan, purple, green). Pure CSS animations managed
// in globals.css — they pause automatically for prefers-reduced-motion.
// Decorative only: hidden from assistive technology.
export function LiquidBackground() {
  return (
    <div className="liquid-scene" aria-hidden="true" />
  );
}
