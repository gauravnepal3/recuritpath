import React from 'react'
import OrganizationName from './_components/OrganizationName'
import { currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@repo/database'
import OrganizationImage from './_components/OrganizationImage';
import { Avatar, AvatarImage, AvatarFallback } from '@repo/ui/components/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu"
import { Ellipsis } from 'lucide-react';
import { Button, buttonVariants } from '@repo/ui/components/button';
import { AddTeamMember } from './_components/AddTeamMember';
import { cn } from '@/lib/utils';

const getOrganizationDetails = async ({ organizationId }: { organizationId: string }) => {
    return await prisma.organization.findFirst({
        where: {
            id: organizationId
        },
        include: {
            organizationRole: {
                select: {
                    id: true,
                    role: true,
                    email: true,
                    status: true,
                    user: {  // Prisma will join this if the relation exists
                        select: {
                            email: true,
                            name: true,
                            image: true
                        }
                    }
                },
            }
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
            <div className="mt-8">
                <div className="flex justify-between items-center">
                    <div className="text-sm font-bold">
                        Team Members
                    </div>
                    <AddTeamMember userId={user.id} organizationId={organizationDetails.id} />
                </div>
                <div className="">
                    {organizationDetails.organizationRole.map(x => (
                        <div className="my-3 grid border-b py-2 grid-cols-4 items-center" key={x.id}>
                            <div className="flex items-center gap-x-2">
                                <Avatar className="h-10 w-10 rounded-lg">

                                    <AvatarImage src={x?.user?.image ?? ''} alt={x?.user?.name ?? ''} />
                                    {/* @ts-ignore */}
                                    <AvatarFallback className="rounded-lg bg-primary text-secondary">{Array.from(x.email ?? '')[0]}</AvatarFallback>
                                </Avatar>
                                <div className="">
                                    <p className="capitalize text-sm">{x?.user?.name}</p>
                                    <div className="text-xs text-muted-foreground">
                                        {x.email}
                                    </div>
                                </div>
                            </div>
                            <div className="text-sm mx-auto text-muted-foreground">
                                {x.role}
                            </div>
                            <div className="text-sm mx-auto text-muted-foreground">
                                {x.status}
                            </div>
                            <div className="flex justify-center">
                                <DropdownMenu>
                                    <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost' }), 'w-7 h-7')}>

                                        <Ellipsis />

                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>Update Role</DropdownMenuItem>
                                        <DropdownMenuItem>Remove</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default page