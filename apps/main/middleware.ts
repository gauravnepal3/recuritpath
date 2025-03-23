import NextAuth from "next-auth";
import jwt from "jsonwebtoken";
import authConfig from "@/auth.config";
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  adminRoutes,
  publicRoutes,
} from "@/routes";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
const { auth } = NextAuth(authConfig);
const SECRET_KEY = process.env.AUTH_SECRET!;

async function verifyJWT(token: string): Promise<{ organizationId: string; userRole: string } | null> {
  try {
    const secret = new TextEncoder().encode(SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);
    return payload as { organizationId: string; userRole: string };
  } catch (error) {
    return null;
  }
}
export default auth(async (req: any) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAdminRoute = adminRoutes.some((route) => nextUrl.pathname.startsWith(route));

  // Skip middleware for API auth routes
  if (isApiAuthRoute) {
    return null;
  }

  // Redirect logged-in users away from auth pages (e.g., login/register)
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return null;
  }

  // Redirect guests to login page (if the route is not public)
  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname + (nextUrl.search ? nextUrl.search : "");
    return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl));
  }

  // **Only check role if accessing an admin route**
  if (isAdminRoute) {
    const jwtRole = req.cookies.get("organizationRole")?.value;

    if (!jwtRole) {
      return NextResponse.redirect(new URL("/organization/unauthorized", req.url));
    }
    const payload = await verifyJWT(jwtRole);
    if (!payload) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }

    const { userRole: role } = payload;
    if (role !== "ADMIN" && role !== "OWNER") {
      return NextResponse.redirect(new URL("/organization/unauthorized", req.url));
    }
  }

  return null; // Allow access if no conditions were met
});

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
