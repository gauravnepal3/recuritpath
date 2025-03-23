import React from 'react'
import { prisma } from '@repo/database'
import CaptchaProvider from './CaptchaProvider'
import { Badge } from '@repo/ui/components/badge'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@repo/ui/lib/utils'
import { buttonVariants } from '@repo/ui/components/button'
import JobForm from './JobForm'
import TipTapHTMLRenderer from './TipTapRender'

const getJobDetails = async (jobID: string) => {
    return await prisma.jobPost.findFirst({
        where: {
            id: jobID
        },
        include: {
            jobApplication: true,
            organization: {
                select: {
                    name: true,
                    logo: true
                }
            }
        }
    })
}
const JobDetailsPages = async ({ jobID }: { jobID: string }) => {
    const jobDetails = await getJobDetails(jobID)
    if (!jobDetails) return null
    return (
        <div className='max-w-screen-lg mx-auto'>
            <div className="border-b py-4 ">
                {jobDetails.organization?.name}
            </div>
            <div className="mt-12 grid grid-cols-6">
                <div className="col-span-4">
                    <div className="flex items-center gap-x-1">
                        <Link className={cn(buttonVariants({ variant: "ghost" }), 'w-8 h-8 p-2')} href={`/`}>
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
                            {jobDetails?.displaySalary !== "Not Shown" &&
                                <Badge variant={'outline'}>
                                    {jobDetails.displaySalary === "Range" && `${jobDetails.minimumAmount} ${jobDetails.currency}  - ${jobDetails.maximumAmount} ${jobDetails.currency}`}
                                    {jobDetails.displaySalary === "Fixed Amount" && `${jobDetails.salaryAmount} ${jobDetails.currency}`}
                                </Badge>
                            }
                        </div>
                    </div>
                    {jobDetails?.description &&
                        <div className="mt-5">
                            <div className="font-bold">
                                Description
                            </div>
                            <div className="mt-2">
                                <TipTapHTMLRenderer content={jobDetails.description} />
                            </div>
                        </div>}
                    <div className="border mt-5 p-4 rounded-lg">
                        <CaptchaProvider>

                            {jobDetails?.jobApplication && <JobForm formDetails={jobDetails?.jobApplication} />}
                        </CaptchaProvider>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JobDetailsPages