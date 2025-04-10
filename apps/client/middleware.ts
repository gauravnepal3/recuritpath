export const config = {
    matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     * 5. /preview (preview links)
     */
        "/((?!api/|_next/|_static/|_vercel|preview|[\\w-]+\\.\\w+).*)",
    ],
};

import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;

    // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
    let hostname = req.headers
        .get("host")!
        .replace(".localhost:3001", `.${process.env.NEXT_PUBLIC_CLIENT_URL}`);

    const searchParams = url.searchParams.toString();
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

    if (
        hostname === "localhost:3001" ||
        hostname === process.env.NEXT_PUBLIC_CLIENT_URL
    ) {
        return NextResponse.rewrite(
            new URL(`/home${path === "/" ? "" : path}`, req.url)
        );
    }

    return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
}
