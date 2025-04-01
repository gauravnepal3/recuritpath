import React from 'react'
import { MailingTemplate } from '@/constants/mailing-template'
import { prisma } from "@repo/database"
import { currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { EditTemplateDialog } from './_components/EditTemplateDialog';
import { AddTemplateDialog } from './_components/AddTemplate';
const getJobMailingTemplate = async (jobID: string) => {
    return await prisma.jobMailingTemplate.findMany({
        where: {
            jobId: jobID
        }
    })

}
const Page = async ({
    params,
}: {
    params: Promise<{ slug: string }>
}) => {
    const user = await currentUser();
    if (!user?.id) {
        redirect('/login')
    }
    const jobID = (await params).slug
    const jobMailingTemplate = await getJobMailingTemplate(jobID)
    const combinedTemplates = MailingTemplate.map((template) => {
        const userTemplate = jobMailingTemplate.find(
            (jobTemplate) => jobTemplate.name === template.name
        );

        if (userTemplate) {
            return {
                ...template,
                ...userTemplate,
                isCustom: false,
                isDefaultEdited: true, // Default template with edited body
            };
        }

        return {
            ...template,
            isCustom: false,
            isDefaultEdited: false, // Default template without edits
        };
    }).concat(
        jobMailingTemplate.filter(
            (jobTemplate) =>
                !MailingTemplate.some((template) => template.name === jobTemplate.name)
        ).map((customTemplate) => ({
            ...customTemplate,
            isCustom: true, // Custom template created by the user
            isDefaultEdited: false,
        }))
    );
    return (
        <div className='p-4'>
            <div className="flex justify-between items-center">

            <div className="text-2xl font-bold">Templates</div>
                <AddTemplateDialog
                    userID={user.id} jobID={jobID}
                />
            </div>
            <div className="text-muted-foreground text-xs mt-2">You can manage different templates making your recruitment smoother</div>
            <div className="mt-5 flex-col space-y-1 overflow-hidden">
                {combinedTemplates.map((template, index) => (
                    <div key={index} className="border-b last:border-none bg-sidebar-accent p-4">
                        <div className="flex items-center justify-between">
                            <div className="font-bold">{template.name}</div>
                            <div className="flex gap-x-3">
                                <EditTemplateDialog userID={user.id} jobID={jobID} template={template} />
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-sidebar-accent-foreground">{template.body}</div>
                    </div>))}

            </div>
        </div>

    )
}

export default Page