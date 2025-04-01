import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@repo/database"; // Adjust path based on your setup
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import * as jose from 'jose'
import { addNotification } from "@/actions/notification";
const SECRET_KEY = process.env.AUTH_SECRET || "your_secret_key"; // Use environment variable

export async function GET(req: NextRequest) {
    try {
        const user = await currentUser()
        const userDetails = await prisma.user.findFirst({
            where: {
                id: user.id
            }
        })
        const { searchParams } = new URL(req.url);
        const inviteId = searchParams.get("inviteId");

        if (!inviteId) {
            return NextResponse.redirect(new URL("/invite-status?status=error&message=" + encodeURIComponent("Invalid invite ID"), req.url));
        }

        // Decode the invite token
        let decoded;
        try {
            const secret = new TextEncoder().encode(SECRET_KEY);
            const { payload } = await jose.jwtVerify(inviteId, secret);
            decoded = payload;
        } catch (error) {
            return NextResponse.redirect(
                new URL("/invite-status?status=error&message=" + encodeURIComponent("Invalid or expired invite link"), req.url)
            );
        }


        const { inviteId: dbInviteId, email: dbEmail } = decoded as { inviteId: string, email: string };
        if (userDetails?.email !== dbEmail) {
            return NextResponse.redirect(new URL("/invite-status?status=error&message=" + encodeURIComponent("Invalid request made"), req.url));
        }
        // Ensure the invite exists and is still pending
        const invitation = await prisma.organizationUserRole.findUnique({
            where: { id: dbInviteId },
        });

        if (!invitation) {
            return NextResponse.redirect(new URL("/invite-status?status=error&message=" + encodeURIComponent("Invitation not found"), req.url));
        }

        if (invitation.status === "ACTIVE") {
            return NextResponse.redirect(new URL("/invite-status?status=error&message=" + encodeURIComponent("Invitation already accepted"), req.url));
        }

        // Update the invitation status
        const userRole = await prisma.organizationUserRole.update({
            where: { id: dbInviteId },
            data: {
                status: "ACTIVE",
                userId: userDetails.id
            },
        });

        const notification = await addNotification({
            message: `${userDetails.name} has joined the organization.`,
            category: "INVITATION",
            type: "ORGANIZATION",
            organizationID: userRole.organizationId,
            notificationPermission: "ALL",
            priority: "HIGH",
            actionUrl: "/organization/setting",
        })
        // Redirect to success page
        return NextResponse.redirect(new URL("/invite-status?status=success&message=" + encodeURIComponent("Invitation accepted successfully"), req.url));
    } catch (error) {
        console.error("Error accepting invitation:", error);
        return NextResponse.redirect(new URL("/invite-status?status=error&message=" + encodeURIComponent("Internal Server Error"), req.url));
    }
}