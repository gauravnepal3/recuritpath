'use client'
import React from 'react'
import { useCookies } from 'next-client-cookies';
import { useRouter } from 'next/navigation'
import { Button } from '@repo/ui/components/button'
import { setActiveOrganization } from '@/actions/organization';
const OrganizationSetButton = ({ organizationID, userID }: { organizationID: string, userID: string }) => {
    const cookies = useCookies();
    const router = useRouter()
    return (
        <Button variant={'outline'} onClick={() => {
            setActiveOrganization({ organizationId: organizationID, userId: userID })
            cookies.set('organization', organizationID)
            router.push('/')

        }}>View</Button>
    )
}

export default OrganizationSetButton