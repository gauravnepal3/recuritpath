import { Button } from '@repo/ui/components/button'
import React, { Suspense } from 'react'
import { AddOrganizationDialog } from './_components/AddOrganizationDialog'
import { currentUser } from '@/lib/auth'
import { getOrganization } from './action'
import { Badge } from '@repo/ui/components/badge'
import OrganizationSetButton from './_components/OrganizationSetButton'
import { redirect } from 'next/navigation'

const ManageOrganization = async () => {
    const user = await currentUser()
    if (!user) {
        redirect('/auth/login')
    }
    const userOrganization = await getOrganization({ userID: user.id ?? '' })
    return (
        <div className='container mx-auto pt-8 max-w-screen-sm'>
            <div className="flex justify-between border-b pb-3 items-center">
                <div className="">Organization</div>
                <AddOrganizationDialog userID={user?.id!} />
            </div>

            <div className="mt-3">
                {userOrganization.length === 0 ?
                    <div className='text-center'>
                        <span className='text-xs text-muted-foreground'>No Organization</span>
                    </div> : <div className='flex-col space-y-5'>
                        {userOrganization.map(x => (
                            <div key={x.id} className="w-full flex items-center justify-between rounded-lg px-3 py-4 border">
                                <div className="">
                                    <div className="font-bold">
                                        {x.name}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="">
                                            <Badge className='font-normal text-xs text-muted-foreground' variant={'outline'}>{x.organizationRole.find(x => x.user.email === user.email)?.role}</Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {x.organizationRole.length} member
                                        </div>
                                    </div>
                                </div>
                                <div className="">
                                    <OrganizationSetButton organizationID={x.id} />
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </div>
        </div>
    )
}

export default ManageOrganization