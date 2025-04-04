import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        NextResponse.json({ message: "Running" }, { status: 200 });
    } catch (error) {
        console.error("Error generating pre-signed URL:", error);
        NextResponse.json({ error: "Failed to run health check" }, { status: 500 });
    }
}