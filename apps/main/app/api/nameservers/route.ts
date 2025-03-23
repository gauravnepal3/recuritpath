import dns from "dns/promises"; // Use Node's built-in DNS module
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain || typeof domain !== "string") {
        return NextResponse.json({ error: "Invalid domain provided" }, { status: 400 });
    }

    try {
        const nameservers = await dns.resolveNs(domain);
        return NextResponse.json({ nameservers }, { status: 200 });
    } catch (error: any) {
        if (error.code === "ENOTFOUND") {
            return NextResponse.json(
                { error: `No nameservers found for ${domain}. Please ensure the domain is registered and configured correctly.` },
                { status: 404 }
            );
        }
        return NextResponse.json({ error: `Error fetching nameservers: ${error.message}` }, { status: 500 });
    }
}
