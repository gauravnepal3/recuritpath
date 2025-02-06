import React from 'react'
import { prisma } from '@repo/database'
import JobForm from './JobForm'
import Link from 'next/link'
import { cn } from '@repo/ui/lib/utils'
import { buttonVariants } from '@repo/ui/components/button'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@repo/ui/components/badge'
import CaptchaProvider from './CaptchaProvider'

const getPreviewDetails = async (previewID: string) => {
    return await prisma.jobPreview.findFirst({
        where: {
            id: previewID
        },
        include: {
            organization: {
                select: {
                    id: true,
                    logo: true,
                    name: true,
                    jobPost: {
                        select: {
                            id: true,
                            country: true,
                            countryResidence: true,
                            category: true,
                            title: true,
                            remoteOption: true,
                            jobApplication: true
                        }
                    }
                }
            }
        }
    })
}
const JobPreview = async ({ previewID, jobID }: { previewID: string, jobID: string }) => {
    const previewDetails = await getPreviewDetails(previewID)
    const jobDetails = previewDetails?.organization?.jobPost.find(x => x.id === jobID)
    if (previewDetails?.expiresAt && new Date(previewDetails.expiresAt) > new Date()) {
        return (
            <div className='max-w-screen-lg mx-auto'>
                <div className="border-b py-4 ">
                    {previewDetails.organization?.name}
                </div>
                <div className="mt-12 grid grid-cols-6">
                    <div className="col-span-4">
                        <div className="flex items-center gap-x-1">
                            <Link className={cn(buttonVariants({ variant: "ghost" }), 'w-8 h-8 p-2')} href={`/preview?preview=${previewID}`}>
                                <ArrowLeft className='size-7' />
                            </Link>
                            <div className="flex gap-x-2">
                                <div className="text-2xl font-bold">
                                    {jobDetails?.title}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-x-1">
                            <div className="w-8 h-8"></div>
                            <div className="flex gap-x-4 mt-2">
                                {jobDetails?.country?.split('/')[0] &&
                                    <Badge variant={'outline'}>
                                        {jobDetails?.country?.split('/')[0]}
                                    </Badge>
                                }
                                {jobDetails?.remoteOption &&
                                    <Badge variant={'outline'}>
                                        {jobDetails.remoteOption}
                                    </Badge>
                                }
                            </div>
                        </div>

                        <div className="border mt-5 p-4 rounded-lg">
                            <CaptchaProvider>

                                {jobDetails?.jobApplication && <JobForm formDetails={jobDetails?.jobApplication} />}
                            </CaptchaProvider>
                        </div>
                    </div>
                </div>
                <div className="col-span-2"></div>
            </div>
        )
    } else {
        return (
            <div>Preview has expired</div>
        )
    }
}

export default JobPreview