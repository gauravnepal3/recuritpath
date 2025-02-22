import { prisma } from "@repo/database";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { currentUser } from "./auth";
export const getOrganizationTier = async () => {
    const user = await currentUser();
    if (!user) {
        redirect('/auth/login')
    }
    const activeOrganization = (await cookies()).get('organization')?.value
    if (!activeOrganization) {
        redirect('/')
    }
    const organizationTier = await prisma.organizationSubscription.findFirst({
        where: {
            organizationId: activeOrganization
        }
    })
    if (!organizationTier) return 'FREE';
    return organizationTier?.subscriptionType
}