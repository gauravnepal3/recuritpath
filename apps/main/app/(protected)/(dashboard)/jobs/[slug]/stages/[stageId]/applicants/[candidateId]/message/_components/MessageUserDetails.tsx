import { timeAgo } from '@/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@repo/ui/components/avatar'
import { Badge } from '@repo/ui/components/badge'
import React from 'react'

const MessageUserDetails = ({ name, createdAt, isCandidateMessage }: { name: string, createdAt: Date, isCandidateMessage: Boolean }) => {
    return (
        <div className="flex items-baseline mb-2 gap-x-2">
            <div className="flex">
                <Avatar className="h-8 w-8 rounded">
                    {/* @ts-ignore */}
                    <AvatarFallback className="rounded bg-primary text-secondary">{Array.from(name ?? '')[0]}</AvatarFallback>
                </Avatar>
                <div className="ml-2">
                    <div className="text-xs">
                        {name}
                    </div>
                    <div className="text-muted-foreground text-xs">
                        via email
                    </div>
                </div>
            </div>
            {isCandidateMessage &&
                <div className="ml-2">
                    <Badge className='text-xs font-light'>Candidate</Badge>
                </div>
            }
            <div className="text-muted-foreground ml-4 text-xs">
                {timeAgo(createdAt)}
            </div>
        </div>
    )
}

export default MessageUserDetails