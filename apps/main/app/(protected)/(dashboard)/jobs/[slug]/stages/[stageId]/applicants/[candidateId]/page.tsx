import React from 'react'
import { prisma } from '@repo/database'
import { ArrowLeftRight, ArrowRight, Check, CheckCircle, Inbox, MessageSquare, UserCheck } from 'lucide-react'
import { Timeline, TimelineContent, TimelineIcon, TimelineItem } from '@repo/ui/components/timeline'
import { timeAgo } from '@/lib/utils'
import { Button } from '@repo/ui/components/button'
import { AddComment } from './_components/AddComment'
import { currentRole, currentUser } from '@/lib/auth'
import { EditComment } from './_components/EditComment'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar'
import { AddReview } from './_components/AddReview'
import { generatePresignedUrl } from '@/lib/s3'


const getCandidateDetails = async (candidateID: string) => {
    return await prisma.candidateApplication.findFirst({
        where: {
            id: candidateID
        },
        include: {
            formResponses: true,
            jobPost: true,
            CandidateTimeline: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            image: true
                        }
                    }
                }
            }
        }
    })
}
const CandidatePage = async ({
    params,
}: {
    params: Promise<{ slug: string, candidateId: string }>
}) => {
    const user = await currentUser();
    if (!user) {
        return
    }
    const jobID = (await params).slug
    const candidateId = (await params).candidateId
    const candidateData = await getCandidateDetails(candidateId)
    const timelineData = candidateData?.CandidateTimeline.filter(x => x.actionType !== "APPLIED").map(x => ({
        id: x.id,
        time: timeAgo(x.createdAt),
        type: x.actionType,
        title: x.timelineText,
        user: {
            name: x.user?.name,
            image: x.user?.image
        },
        comment: x.comment,
        tag: '',
        icon: x.actionType === "EVENT" && (x.timelineText.includes('Hired') ? <UserCheck className='size-4 text-muted-foreground' /> : <ArrowLeftRight className='size-4 text-muted-foreground' />)
    }))
    const resumeName = candidateData?.formResponses.find(x => x.label === "Resume")?.value
    const fileURL = await generatePresignedUrl(process.env.AWS_S3_BUCKET_NAME!, `uploads/${resumeName}`!)
    return (
        <div className=''>
            <div className="text-2xl font-bold border-b p-2 pt-4">Overview</div>
            <div className="max-w-xl mx-auto mt-10">
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-4 top-0 w-1 h-full bg-gray-300"></div>
                    {/* Created Timeline */}
                    <div className="relative flex items-center space-x-4 mb-2">
                        <div className="relative z-10 w-8 h-8 flex items-center justify-center bg-background rounded border">
                            <Inbox className='size-4' />
                        </div>
                        {/* Timeline Content */}
                        <div className="flex-1">
                            <div className="text-xs text-gray-600">
                                {candidateData?.CandidateTimeline.find(x => x.actionType === "APPLIED")?.timelineText}
                                <span className='text-primary font-bold text-xs ml-3'>
                                    {timeAgo(candidateData?.CandidateTimeline.find(x => x.actionType === "APPLIED")?.createdAt as Date)}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Additional Question Display */}
                    <div className="relative flex items-start space-x-4 mb-8">
                        {/* Normal Timeline Events (with Icons) */}
                        <div className="relative -left-7 w-full ml-[30px]">
                            <div className="mt-2 p-4 border bg-background grid place-items-center min-h-[100px] rounded">
                                <div className="">
                                    <div className="text-center text-sm mb-1">
                                        No question response to display
                                    </div>
                                    <div className="text-xs text-muted-foreground ">
                                        Customize additional question from setting tab
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {timelineData?.map((item, index) => (
                        <div key={item.id} className="relative flex items-center space-x-4 mb-4">
                            {/* Normal Timeline Events (with Icons) */}
                            {item.type === "EVENT" ? (
                                <>
                                    {/* Timeline Icon (Placed Over the Line) */}
                                    <div className="relative z-10 w-8 h-8 flex items-center justify-center bg-background rounded border">
                                        {item.icon}
                                    </div>
                                    {/* Timeline Content */}
                                    <div className="flex-1">
                                        <div className="text-xs text-muted-foreground">

                                            {item.title} ·
                                            <span className='text-primary font-bold text-xs ml-2'>

                                                {item.time}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Review Timeline (Without Icon, Full-Width Card) */
                                <div className="relative -left-7 w-full ml-[30px]">
                                    <div className="px-4 py-2 border rounded-lg bg-background">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-x-2">
                                                <Avatar className="h-6 w-6 rounded-lg">
                                                    <AvatarImage src={user.image} alt={user.name} />
                                                    {/* @ts-ignore */}
                                                    <AvatarFallback className="rounded-lg bg-primary text-secondary">{Array.from(user?.name ?? '')[0]}</AvatarFallback>
                                                </Avatar>
                                                <p className="text-xs text-muted-foreground">{item.title} · {item.time}</p>
                                            </div>
                                            <div className="">
                                                <EditComment userID={user.id} candidateID={candidateId} jobID={jobID} timelineID={item.id} comment={item.comment ?? ''} />
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-800">{item.comment}</p>
                                        {item.tag && (
                                            <span className="mt-2 inline-block px-3 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded-md">
                                                {item.tag}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="relative flex items-start space-x-4 mb-8">
                        {/* Normal Timeline Events (with Icons) */}
                        <div className="relative -left-7 w-full ml-[30px]">
                            <div className="mt-2 p-4 border bg-background flex gap-x-4 rounded">
                                {candidateData?.jobPost && (
                                    <AddReview resumeLink={fileURL} userID={user.id} candidateID={candidateId} jobID={jobID} jobDetails={candidateData.jobPost} formResponse={candidateData?.formResponses ?? []} />
                                )}

                                <AddComment userID={user.id} candidateID={candidateId} jobID={jobID} />
                                <Button variant={'secondary'} className='text-xs font-normal'>
                                    Request review
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CandidatePage