import React from 'react'
import { EditMessageTemplate } from './_components/EditTemplateDialog'
import { MailingTemplate } from '@/constants/mailing-template'
import { prisma } from "@repo/database"
import { currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
const getJobMailingTemplate = async (jobID: string) => {
    return await prisma.jobMailingTemplate.findMany({
        where: {
            id: jobID
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
        return {
            ...template,
            ...userTemplate,
            isCustom: !!userTemplate,
        };
    });
    return (
        <div className='p-4'>
            <div className="text-2xl font-bold">Templates</div>
            <div className="text-muted-foreground text-xs mt-2">You can manage different templates making your recruitment smoother</div>
            <div className="mt-5 flex-col space-y-1 overflow-hidden">
                {combinedTemplates.map((template, index) => (
                    <div key={index} className="border-b last:border-none bg-sidebar-accent p-4">
                        <div className="flex items-center justify-between">
                            <div className="font-bold">{template.name}</div>
                            <div className="flex gap-x-3">
                                {template.id}
                                <EditMessageTemplate />
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-sidebar-accent-foreground">{template.body}</div>
                    </div>))}

            </div>
        </div>

    )
}

export default Page