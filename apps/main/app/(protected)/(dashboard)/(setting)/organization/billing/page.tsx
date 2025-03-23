import { currentUser } from '@/lib/auth'
import { Avatar, AvatarImage, AvatarFallback } from '@repo/ui/components/avatar'
import { Badge } from '@repo/ui/components/badge';
import { Lock } from 'lucide-react';
import { redirect } from 'next/navigation';
import React from 'react'
import { prisma } from '@repo/database'
import { cookies } from 'next/headers';
const getOrganizationSubscription = async (organizationId: string, userId: string) => {
    return await prisma.organizationSubscription.findFirst({
        where: {
            organizationId: organizationId
        }
    })
}
const Account = async () => {
    const user = await currentUser();
    const cookiesProvider = await cookies()
    const organizationId = cookiesProvider.get('organization')?.value
    if (!organizationId) {
        redirect('/')
    }
    if (!user) {
        redirect('/auth/login')
    }
    const organizationSubscription = await getOrganizationSubscription(organizationId, user.id)
    return (
        <div className='p-4'>
            <div className="text-xl font-bold">
                Billing
            </div>
            <div className="">
                Current Plan
            </div>
            <div className="">
                {organizationSubscription?.subscriptionType ?? 'Free'}
            </div>
        </div>
    )
}

export default Account