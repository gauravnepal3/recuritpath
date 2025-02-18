import React from 'react'
import OrganizationName from './_components/OrganizationName'
import { currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@repo/database'
import OrganizationImage from './_components/OrganizationImage';
const getOrganizationDetails = async ({ organizationId }: { organizationId: string }) => {
    return await prisma.organization.findFirst({
        where: {
            id: organizationId
        }
    })
}
const page = async () => {
    const cookieProvider = await cookies();
    const user = await currentUser();
    if (!user) {
        redirect('/auth/login')
    }
    const activeOrganization = cookieProvider.get('organization')
    const organizationDetails = await getOrganizationDetails({ organizationId: activeOrganization?.value ?? '' })
    if (!organizationDetails) {
        return 404;
    }
    return (
        <div className='p-4'>
            <div className="text-xl font-bold">
                Manage Organization
            </div>
            <div className="">
                <OrganizationName userID={user.id} organizationID={activeOrganization?.value ?? ''} organizationName={organizationDetails?.name} />
            </div>
            <div className="mt-4">
                <OrganizationImage organizationID={organizationDetails.id} image={organizationDetails.logo ? `${process.env.S3_PUBLIC_URL}/${organizationDetails.logo}` : null} />
            </div>
        </div>
    )
}

export default page