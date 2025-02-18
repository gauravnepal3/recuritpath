import { Button } from '@repo/ui/components/button'
import { Send } from 'lucide-react'
import React from 'react'
import EmailMessage from './_components/EmailMessage'
import { currentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@repo/database'
import MessageUserDetails from './_components/MessageUserDetails'
import MessageBox from './_components/MessageBox'
const getCandidateMessages = async (candidateID: string) => {
    return await prisma.emailMessage.findMany({
        where: {
            candidateId: candidateID
        },
        include: {
            candidate: {
                select: {
                    id: true,
                    formResponses: {
                        select: {
                            value: true,
                            label: true,
                            id: true
                        }
                    }
                }
            },
            user: {
                select: {
                    email: true,
                    image: true,
                    name: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}




const Message = async ({
    params,
}: {
    params: Promise<{ slug: string, candidateId: string }>
}) => {
    const user = await currentUser();
    if (!user) {
        redirect('/auth/login')
    }
    const candidateID = (await params).candidateId
    const candidateMessages = await getCandidateMessages(candidateID)
    return (
        <div className="flex flex-col h-[calc(100vh-5rem)]">
            {/* Title at the top */}
            <div className="text-2xl font-bold border-b p-4">
                Messages
            </div>

            {/* Scrollable message area in the middle */}

            <MessageBox candidateMessages={candidateMessages} />

            {/* Message input box at the bottom */}
            <EmailMessage candidateID={candidateID} userID={user.id} />
        </div>
    )
}

export default Message