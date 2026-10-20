// Session cookie contract shared by the Node runtime (route handlers, server
// components) and the Edge runtime (proxy). This module must stay dependency
// free so it can be imported from every runtime.

export const SESSION_COOKIE = "glass_session";

// Mirrors the JWT expiry (1 hour) used when signing tokens.
export const SESSION_MAX_AGE_SECONDS = 60 * 60;
