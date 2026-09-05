import { prisma } from "@repo/database";
import { requireActiveOrganization } from "./organization";
export const getOrganizationTier = async () => {
    const { organizationId } = await requireActiveOrganization();
    const organizationTier = await prisma.organizationSubscription.findFirst({
        where: {
            organizationId
        }
    })
    if (!organizationTier) return 'Free';
    return organizationTier?.subscriptionType
}