import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";

const rateLimitMessage = { error: "Too many attempts. Try again in a few minutes." };

/**
 * Stable per-client key behind Coolify/Traefik.
 * Prefer the leftmost X-Forwarded-For entry (original client). Express `req.ip` with a
 * wrong hop count can track a proxy edge address that changes between requests, which
 * resets the counter every time (remaining stuck at max-1).
 */
export function authClientKey(req: Request): string {
  const forwarded = req.headers?.["x-forwarded-for"];
  const raw =
    typeof forwarded === "string"
      ? forwarded
      : Array.isArray(forwarded)
        ? forwarded[0]
        : undefined;
  const leftmost = raw?.split(",")[0]?.trim();
  if (leftmost) {
    return ipKeyGenerator(leftmost);
  }
  const ip = req.ip ?? req.socket?.remoteAddress ?? "unknown";
  return ipKeyGenerator(ip);
}

/** Created once at module load — never inside a route handler. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitMessage,
  keyGenerator: (req) => authClientKey(req),
});

/** Created once at module load — never inside a route handler. */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: rateLimitMessage,
  keyGenerator: (req) => authClientKey(req),
});
