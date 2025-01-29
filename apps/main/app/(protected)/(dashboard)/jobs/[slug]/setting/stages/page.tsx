import { currentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import React from 'react'
import { prisma } from "@repo/database"
import ViewStages from './_components/ViewStages'

const getJobStages = async (jobID: string) => {
    return await prisma.jobStage.findMany({
        where: {
            jobId: jobID,
            isDeleted: false
        }
    })

}
const StagesSetting = async ({
    params,
}: {
    params: Promise<{ slug: string }>
}) => {
    const user = await currentUser();
    if (!user?.id) {
        redirect('/login')
    }
    const jobID = (await params).slug
    const jobStages = await getJobStages(jobID)
    return (
        <div className='p-4'>
            <div className="text-2xl font-bold">Stages</div>
            <div className="text-muted-foreground text-xs mt-2">You can manage different stages making your recruitment smoother</div>
            {jobStages && <ViewStages jobID={jobID} userID={user.id} jobStages={
                jobStages.sort((a, b) => {
                    // Custom sorting logic
                    if (a.name === "Inbox") return -1; // Always place "Inbox" at the top
                    if (b.name === "Inbox") return 1;

                    if (a.name === "Archived") return 1; // Always place "Archived" at the last
                    if (b.name === "Archived") return -1;

                    if (a.name === "Hired") return 1; // Always place "Hired" second last
                    if (b.name === "Hired") return -1;

                    // For other items, follow the displayOrder
                    return a.displayOrder - b.displayOrder;
                })
            } />}
        </div>
    )
}

export default StagesSetting