import "server-only";

/**
 * Same fixed-window limiter as apps/main, backed by the shared RateLimit table
 * so both apps and all replicas share one budget per key.
 */
import { prisma } from "@repo/database";

export async function rateLimit({
    key,
    limit,
    windowSeconds,
}: {
    key: string;
    limit: number;
    windowSeconds: number;
}): Promise<{ ok: boolean; retryAfterSeconds: number }> {
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
        return {
            ok: record.count <= limit,
            retryAfterSeconds: Math.max(
                1,
                Math.ceil((expiresAt.getTime() - now.getTime()) / 1000)
            ),
        };
    } catch (error) {
        console.error("Rate limit check failed; allowing request:", error);
        return { ok: true, retryAfterSeconds: 0 };
    }
}

export function clientIp(headers: Headers): string {
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) {
        const first = forwarded.split(",")[0]?.trim();
        if (first) return first;
    }
    return headers.get("x-real-ip")?.trim() || "unknown";
}
