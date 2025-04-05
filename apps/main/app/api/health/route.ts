import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

export async function GET(req: NextRequest) {
    const shouldSkipPrisma = process.env.DISABLE_PRISMA === "true";

    try {
        if (!shouldSkipPrisma) {
            const organizations = await prisma.organization.findMany();
            return NextResponse.json({ message: "DB connection successful", organizations }, { status: 200 });
        } else {
            return NextResponse.json({ message: "Prisma connection skipped" }, { status: 200 });
        }
    } catch (error) {
        console.error("Prisma error in health check:", error instanceof Error ? error.stack : error);
        return NextResponse.json({ error: "Failed to run health check" }, { status: 500 });
    }
}
