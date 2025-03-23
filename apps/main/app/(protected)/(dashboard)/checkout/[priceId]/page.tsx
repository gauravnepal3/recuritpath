import { CheckoutHeader } from './_components/checkout-header';
import { CheckoutContents } from './_components/checkout-contents';
import { currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@repo/database'
import { cookies } from 'next/headers';
const getOrganizationSubscription = async (organizationId: string, userId: string) => {
    return await prisma.organizationSubscription.findFirst({
        where: {
            organizationId: organizationId
        }
    })
}
export default async function CheckoutPage() {
    const cookiesProvider = await cookies()
    const user = await currentUser()
    if (!user) {
        redirect('/auth/login')
    }
    const organizationId = cookiesProvider.get('organization')?.value
    if (!organizationId) {
        redirect('/')
    }
    const organizationSubscription = await getOrganizationSubscription(organizationId, user.id)
    if (organizationSubscription) {
        redirect('/organization/billing')
    }
    return (
        <div className={'w-full min-h-screen relative overflow-hidden'}>
            <div
                className={'mx-auto max-w-6xl relative px-[16px] md:px-[32px] py-4 flex flex-col gap-6 justify-between'}
            >
                {!organizationSubscription ?
                    <CheckoutContents organizationSubscription={organizationSubscription} userEmail={user.email} userId={user.id} organizationId={organizationId} />
                    :
                    <>

                    </>
                }
            </div>
        </div>
    );
}