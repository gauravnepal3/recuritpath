import { CheckoutHeader } from './_components/checkout-header';
import { CheckoutContents } from './_components/checkout-contents';
import { currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
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
    return (
        <div className={'w-full min-h-screen relative overflow-hidden'}>
            <div
                className={'mx-auto max-w-6xl relative px-[16px] md:px-[32px] py-4 flex flex-col gap-6 justify-between'}
            >
                <CheckoutContents userEmail={user.email} userId={user.id} organizationId={organizationId} />
            </div>
        </div>
    );
}