import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        return NextResponse.json({ message: "Running" }, { status: 200 });
    } catch (error) {
        console.error("Error generating pre-signed URL:", error);
        return NextResponse.json({ error: "Failed to run health check" }, { status: 500 });
    }
}