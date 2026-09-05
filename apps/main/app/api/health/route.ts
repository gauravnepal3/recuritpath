import { NextResponse } from "next/server";
import { prisma } from "@repo/database";

// Public endpoint (see routes.ts) — used by the container healthcheck and the
// load balancer. It must never return application data.
export const dynamic = "force-dynamic";

export async function GET() {
    if (process.env.DISABLE_PRISMA === "true") {
        return NextResponse.json({ status: "ok", db: "skipped" }, { status: 200 });
    }

    try {
        await prisma.$queryRaw`SELECT 1`;
        return NextResponse.json({ status: "ok", db: "up" }, { status: 200 });
    } catch (error) {
        console.error("Health check failed:", error instanceof Error ? error.message : error);
        return NextResponse.json({ status: "error", db: "down" }, { status: 503 });
    }
}
