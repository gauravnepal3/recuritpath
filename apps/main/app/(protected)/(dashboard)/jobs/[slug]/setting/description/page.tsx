import React, { Suspense } from 'react'
import TextEditor from './TextEditor'
import { prisma } from "@repo/database"
import { currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Loading from './loading';
const getJobDetails = async (jobID: string) => {
    return await prisma.jobPost.findFirst({
        where: {
            id: jobID
        },
        select: {
            id: true,
            description: true,
            organizationId: true
        }
    })

}
const DescriptionSetting = async ({
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
        <>
            <Suspense fallback={<Loading />}>
                {jobDetails ? <TextEditor userID={user.id} jobDetails={jobDetails} /> : <></>}
            </Suspense>
        </>
    )
}

export default DescriptionSetting