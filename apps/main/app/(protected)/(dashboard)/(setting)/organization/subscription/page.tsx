import { currentUser } from '@/lib/auth'
import { Avatar, AvatarImage, AvatarFallback } from '@repo/ui/components/avatar'
import { Badge } from '@repo/ui/components/badge';
import { Lock } from 'lucide-react';
import { redirect } from 'next/navigation';
import React from 'react'
import { FcGoogle } from "react-icons/fc";

const Account = async () => {
    const user = await currentUser();
    if (!user) {
        redirect('/auth/login')
    }
    return (
        <div className='p-5'>
            <div className="flex items-center gap-x-4">
                <Avatar className="h-20 w-20 rounded-full">
                    <AvatarImage src={user.image} alt={user.name} />
                    {/* @ts-ignore */}
                    <AvatarFallback className="rounded-lg bg-primary text-secondary">{Array.from(user?.name ?? '')[0]}</AvatarFallback>
                </Avatar>
                <div className="">
                    <div className="font-semibold">
                        {user.name}
                    </div>
                </div>
            </div>
            <div className="flex gap-x-10 mt-4 items-center">
                <div className="text-muted-foreground pl-4 text-xs">
                    Email
                </div>
                <div className="font-semibold text-sm">
                    {user.email}
                </div>
            </div>
            <div className="flex gap-x-10 mt-4 items-center">
                <div className="text-muted-foreground pl-4 text-xs">
                    Provider
                </div>
                <div className="font-semibold text-sm">
                    {user.isOAuth ?
                        <>
                            <Badge variant={'outline'} className='flex gap-x-2'>
                                <FcGoogle className="h-5 w-5" />
                                Google
                            </Badge>

                        </> :
                        <>
                            <Badge variant={'outline'} className='flex gap-x-2'>
                                <Lock className="h-5 w-5" />
                                Credentials
                            </Badge>
                        </>
                    }
                </div>
            </div>
            {/* TODO: Change Password */}
            {/* {user.isOAuth &&
                <>
                    <div className="">
                        <div className="">
                            Change Password
                        </div>
                    </div>
                </>
            } */}
        </div>
    )
}

export default Account