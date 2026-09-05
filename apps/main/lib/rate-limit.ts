import "server-only";

/**
 * Fixed-window rate limiter backed by the database.
 *
 * Both apps run as multiple replicas behind Traefik, so an in-process counter
 * would let each replica grant the full budget. `RateLimit` rows are shared,
 * which keeps one budget per key across the whole deployment.
 */
import { prisma } from "@repo/database";

export interface RateLimitResult {
    ok: boolean;
    remaining: number;
    retryAfterSeconds: number;
}

export interface RateLimitOptions {
    /** Stable identity for the caller + action, e.g. `login:1.2.3.4`. */
    key: string;
    /** Requests allowed per window. */
    limit: number;
    /** Window length in seconds. */
    windowSeconds: number;
}

export async function rateLimit({
    key,
    limit,
    windowSeconds,
}: RateLimitOptions): Promise<RateLimitResult> {
    const now = new Date();
    const windowStart = new Date(
        Math.floor(now.getTime() / (windowSeconds * 1000)) * windowSeconds * 1000
    );
    const expiresAt = new Date(windowStart.getTime() + windowSeconds * 1000);

    try {
        const record = await prisma.rateLimit.upsert({
            where: { key_windowStart: { key, windowStart } },
            create: { key, windowStart, expiresAt, count: 1 },
            update: { count: { increment: 1 } },
            select: { count: true },
        });

        const remaining = Math.max(0, limit - record.count);
        return {
            ok: record.count <= limit,
            remaining,
            retryAfterSeconds: Math.max(
                1,
                Math.ceil((expiresAt.getTime() - now.getTime()) / 1000)
            ),
        };
    } catch (error) {
        // A limiter outage must not take authentication down with it.
        console.error("Rate limit check failed; allowing request:", error);
        return { ok: true, remaining: limit, retryAfterSeconds: 0 };
    }
}

/**
 * Best-effort client IP. Traefik sets `x-forwarded-for`; trust only the first
 * entry and only because the app is never exposed directly to the internet.
 */
export function clientIp(headers: Headers): string {
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) {
        const first = forwarded.split(",")[0]?.trim();
        if (first) return first;
    }
    return headers.get("x-real-ip")?.trim() || "unknown";
}

/** Deletes expired windows. Safe to call opportunistically. */
export async function pruneRateLimits(): Promise<void> {
    try {
        await prisma.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    } catch (error) {
        console.error("Rate limit prune failed:", error);
    }
}
