'use client'
import React from 'react'
import { useCookies } from 'next-client-cookies';
import { useRouter } from 'next/navigation'
import { Button } from '@repo/ui/components/button'
const OrganizationSetButton = ({ organizationID }: { organizationID: string }) => {
    const cookies = useCookies();
    const router = useRouter()
    return (
        <Button variant={'outline'} onClick={() => {
            cookies.set('organization', organizationID)
            router.push('/')

        }}>View</Button>
    )
}

export default OrganizationSetButton