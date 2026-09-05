'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@repo/ui/components/button'
import { setActiveOrganization } from '@/actions/organization';
const OrganizationSetButton = ({ organizationID, userID }: { organizationID: string, userID: string }) => {
    const router = useRouter()
    return (
        <Button variant={'outline'}
        onClick={async () => {
            // The server action sets both organization cookies after verifying
            // membership; navigate only once it has.
            await setActiveOrganization({ organizationId: organizationID, userId: userID })
            router.push('/')

        }}>View</Button>
    )
}

export default OrganizationSetButton