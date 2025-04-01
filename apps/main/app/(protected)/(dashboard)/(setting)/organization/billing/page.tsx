import { currentUser } from '@/lib/auth'
import { Avatar, AvatarImage, AvatarFallback } from '@repo/ui/components/avatar'
import { Badge } from '@repo/ui/components/badge';
import { Lock } from 'lucide-react';
import { redirect } from 'next/navigation';
import React from 'react'
import { prisma } from '@repo/database'
import { cookies } from 'next/headers';
import { Button } from '@repo/ui/components/button';
import Link from 'next/link';
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
            <div className="mt-5">
                Current Plan
            </div>
            <div className="flex gap-x-3 items-baseline">
                <Badge className='mt-2'>
                    {organizationSubscription?.subscriptionType ?? 'Free'}
                </Badge>
                <Link href={'/pricing'} className="text-xs">
                    Upgrade
                </Link>
            </div>
        </div>
    )
}

export default Account