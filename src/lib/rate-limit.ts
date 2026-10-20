// Basic in-memory fixed-window rate limiter: 5 login attempts per minute
// per IP. In-memory state is per-process, which is fine for a single-instance
// deployment; for multi-instance production back this with Redis or similar.

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;
// Safety valve so a hostile client rotating spoofed IPs cannot grow the map
// without bound.
const MAX_TRACKED_IPS = 10_000;

const attemptsByIp = new Map<string, number[]>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Records one login attempt for the given IP and reports whether the request
 * is still inside the allowed quota.
 */
export function checkLoginRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const recent = (attemptsByIp.get(ip) ?? []).filter((t) => t > windowStart);

  if (recent.length >= MAX_ATTEMPTS) {
    attemptsByIp.set(ip, recent);
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((recent[0] + WINDOW_MS - now) / 1000)
    );
    return { allowed: false, retryAfterSeconds };
  }

  recent.push(now);
  attemptsByIp.set(ip, recent);

  if (attemptsByIp.size > MAX_TRACKED_IPS) {
    for (const [key, stamps] of attemptsByIp) {
      if (stamps.every((t) => t <= windowStart)) {
        attemptsByIp.delete(key);
      }
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}
