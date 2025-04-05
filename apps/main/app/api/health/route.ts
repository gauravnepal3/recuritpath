import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database"
export async function GET(req: NextRequest) {
    try {
        const organization = await prisma.organization.findMany();
        return NextResponse.json({ message: "Running" }, { status: 200 });
    } catch (error) {
        console.error("Error generating pre-signed URL:", error);
        return NextResponse.json({ error: "Failed to run health check" }, { status: 500 });
    }
}