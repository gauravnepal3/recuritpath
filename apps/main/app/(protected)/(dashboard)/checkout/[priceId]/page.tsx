import { CheckoutHeader } from './_components/checkout-header';
import { CheckoutContents } from './_components/checkout-contents';
import { currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@repo/database'
import { requireActiveOrganization } from '@/lib/organization';
const getOrganizationSubscription = async (organizationId: string) => {
    return await prisma.organizationSubscription.findFirst({
        where: {
            organizationId
        }
    })
}
export default async function CheckoutPage() {
    const user = await currentUser()
    if (!user) {
        redirect('/auth/login')
    }
    const { organizationId } = await requireActiveOrganization()
    const organizationSubscription = await getOrganizationSubscription(organizationId)
    return (
        <div className={'w-full min-h-screen relative overflow-hidden light'}>
            <div
                className={'mx-auto max-w-6xl relative px-[16px] md:px-[32px] py-4 flex flex-col gap-6 justify-between'}
            >
                <CheckoutContents organizationSubscription={organizationSubscription} userEmail={user.email} userId={user.id} organizationId={organizationId} />
            </div>
        </div>
    );
}