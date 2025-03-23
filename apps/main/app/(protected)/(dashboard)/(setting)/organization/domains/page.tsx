import { currentUser } from '@/lib/auth'
import { Avatar, AvatarImage, AvatarFallback } from '@repo/ui/components/avatar'
import { Badge } from '@repo/ui/components/badge';
import { ExternalLink, Lock, UploadCloud } from 'lucide-react';
import { redirect } from 'next/navigation';
import React from 'react'
import { prisma } from '@repo/database'
import { cookies } from 'next/headers';
import { Input } from '@repo/ui/components/input';
import { get } from 'node:https';
import Link from 'next/link';
import { AddDomain } from './_components/AddDomainDialog';
import DomainChecker from './_components/DomainChecker';
const getOrganizationDetails = async (organizationId: string, userId: string) => {
    return await prisma.organization.findFirst({
        where: {
            id: organizationId
        }
    })
}
const Account = async () => {

    const MAIN_DOMAIN = process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3001";

    function getSubdomainUrl(subdomain: string) {
        const url = new URL(MAIN_DOMAIN);
        url.hostname = `${subdomain}.${url.hostname}`;
        return url.toString();
    }


    const user = await currentUser();
    const cookiesProvider = await cookies()
    const organizationId = cookiesProvider.get('organization')?.value
    if (!organizationId) {
        redirect('/')
    }
    if (!user) {
        redirect('/auth/login')
    }
    const organizationDetails = await getOrganizationDetails(organizationId, user.id)
    return (
        <div className='p-4'>
            <div className="text-xl font-bold">
                Domains
            </div>
            <div className="">

            </div>
            <div className='mt-2 rounded p-2 '>
                <div className=" mt-2 space-x-2">
                    <div className="text-xs text-muted-foreground">
                        Assigned Domain
                    </div>
                    <Link href={getSubdomainUrl(organizationDetails?.assignedDomain ?? '')} className="mt-2 flex items-center space-x-2" target="_blank" rel="noopener noreferrer">
                        <div className="">
                            {getSubdomainUrl(organizationDetails?.assignedDomain ?? '')}
                        </div>
                        <ExternalLink size={18} />
                    </Link>
                </div>
            </div>
            <div className="mt-4 rounded p-2">
                <div className="text-xs text-muted-foreground">
                    Custom Domain
                </div>
                {organizationDetails?.customDomain === null ? (
                    <div className='mt-2 grid place-items-center'>
                        <AddDomain organizationId={organizationId} />
                        <div className=" text-muted-foreground mt-2 text-xs space-x-2">
                            No custom domain assigned
                        </div>
                    </div>
                ) : (
                    <div className='mt-2 grid'>
                        <div className=" mt-2 space-x-2">
                            <DomainChecker organizationId={organizationId} domainName={organizationDetails?.customDomain ?? ''} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Account