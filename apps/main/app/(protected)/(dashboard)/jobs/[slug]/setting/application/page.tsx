import React from 'react'
import { prisma } from "@repo/database"
import { currentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ApplicationFrom from './_components/ApplicationForm'

const jobApplicationForm = async (jobID: string) => {
    return await prisma.jobApplication.findMany({
        where: {
            jobId: jobID,
            isDeleted: false
        }
    })
}
const JobApplication = async ({
    params,
}: {
    params: Promise<{ slug: string }>
}) => {
    const user = await currentUser();
    if (!user?.id) {
        redirect('/login')
    }
    const jobID = (await params).slug

    const jobApplicationFormData = await jobApplicationForm(jobID)
    return (
        <div className='p-4'>
            <div className="text-2xl font-bold">Job Application</div>
            <div className="text-muted-foreground text-xs mt-2">You can manage required applicants details for the job post in this page</div>
            <div className="mt-3">
                <ApplicationFrom jobID={jobID} userID={user.id} jobApplicationFormData={jobApplicationFormData} />
            </div>
        </div>
    )
}

export default JobApplication