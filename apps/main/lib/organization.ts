import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as jose from "jose";
import { prisma } from "@repo/database";
import type { OrganizationRole } from "@repo/database";

import { currentUser } from "./auth";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "");

export const ACTIVE_ORG_COOKIE = "organizationRole";

export interface ActiveOrganization {
    userId: string;
    organizationId: string;
    role: OrganizationRole;
}

/**
 * Resolves the caller's active organization.
 *
 * The `organizationRole` cookie is a signed JWT, but a signature alone is not
 * authorization: membership is re-checked against the database on every call so
 * that a revoked member loses access immediately rather than at token expiry.
 *
 * Returns null when the caller has no valid active organization. Use
 * `requireActiveOrganization` when the caller must have one.
 */
export async function getActiveOrganization(): Promise<ActiveOrganization | null> {
    const user = await currentUser();
    if (!user?.id) return null;

    const token = (await cookies()).get(ACTIVE_ORG_COOKIE)?.value;
    if (!token) return null;

    let organizationId: string;
    try {
        const { payload } = await jose.jwtVerify(token, secret);
        organizationId = String(payload.organizationId ?? "");
    } catch {
        return null;
    }
    if (!organizationId) return null;

    // Authoritative check — the cookie only proposes an organization.
    const membership = await prisma.organizationUserRole.findFirst({
        where: { organizationId, userId: user.id, status: "ACTIVE" },
        select: { role: true },
    });
    if (!membership) return null;

    return { userId: user.id, organizationId, role: membership.role };
}

/** Same as `getActiveOrganization`, but redirects instead of returning null. */
export async function requireActiveOrganization(): Promise<ActiveOrganization> {
    const active = await getActiveOrganization();
    if (!active) redirect("/organization/manage");
    return active;
}

/** Asserts the caller is an owner/admin of their active organization. */
export async function requireOrganizationAdmin(): Promise<ActiveOrganization> {
    const active = await requireActiveOrganization();
    if (active.role !== "OWNER" && active.role !== "ADMIN") {
        redirect("/organization/unauthorized");
    }
    return active;
}

/**
 * Prisma `where` fragment restricting `candidateApplication` rows to
 * organizations the given user is an active member of.
 *
 * Candidate ids are cuids that travel in URLs and in email metadata, so an
 * unscoped `where: { id }` lookup lets any authenticated user of any
 * organization read or mutate any candidate in the system. Spread this into
 * every candidate query alongside the id.
 */
export function candidateAccessScope(userId: string) {
    return {
        jobPost: {
            organization: {
                organizationRole: {
                    some: { userId, status: "ACTIVE" },
                },
            },
        },
    } as const;
}
