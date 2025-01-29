import React from 'react'
import BasicForm from './_components/BasicForm'
import { prisma } from "@repo/database"
import { currentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
const getJobDetails = async (jobID: string) => {
    return await prisma.jobPost.findFirst({
        where: {
            id: jobID
        }
    })

}
const Setting = async ({
    params,
}: {
    params: Promise<{ slug: string }>
}) => {
    const user = await currentUser();
    if (!user?.id) {
        redirect('/login')
    }
    const jobID = (await params).slug
    const jobDetails = await getJobDetails(jobID)
    return (
        <div className='p-4'>
            <div className="text-2xl font-bold">Job Details</div>
            <div className="text-muted-foreground text-xs mt-2">You can manage general details of the job post in this page</div>
            <div className="mt-3">
                {jobDetails ? <BasicForm userID={user.id} jobID={jobID} jobDetails={jobDetails} /> : <div>Job details not found</div>}
            </div>
        </div>
    )
}

export default Setting