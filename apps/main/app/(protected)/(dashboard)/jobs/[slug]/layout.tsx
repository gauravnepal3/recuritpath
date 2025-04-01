
import { cookies } from 'next/headers'
import { prisma } from '@repo/database'
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@repo/ui/components/button';
import { SidebarInset, SidebarProvider } from '@repo/ui/components/sidebar';
import { AppSidebar } from './_components/app-sidebar';
import GeneratePreviewJob from '@/app/(protected)/_components/GeneratePreviewJob';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { format } from 'date-fns';
interface ProtectedLayoutProps {
    children: React.ReactNode,
    params: Promise<{ slug: string }>
};

const getJobDetails = async (organizationID: string, userID: string, jobID: string) => {
    return await prisma.jobPost.findFirst({
        where: {
            id: jobID,
            organization: {
                organizationRole: {
                    some: {
                        userId: userID,
                        // role: "OWNER"
                    }
                }
            }
        },
        include: {
            jobStage: {
                where: {
                    isDeleted: false
                },
                select: {
                    id: true,
                    name: true,
                    isDeletable: true,
                    displayOrder: true
                }
            },
            candidateApplication: {
                select: {
                    id: true,
                    stageId: true
                },
                where: {
                    jobId: jobID,
                }
            }
        }
    })

}

const JobLayout = async ({ children, params }: ProtectedLayoutProps) => {
    const user = await currentUser()
    const cookieStore = await cookies()
    const organization = cookieStore.get('organization')
    const jobID = (await params).slug;
    if (!organization) {
        redirect('/organization/manage')
    }
    const jobDetails = await getJobDetails(organization.value, user?.id ?? '', jobID)
    if (!jobDetails) {
        redirect('/')
    }
    return (
        <div className="">
            <div className="border-b w-full h-12 px-4 py-2">
                <div className="flex items-center gap-x-1">
                    <Link className={cn(buttonVariants({ variant: "ghost" }), 'w-8 h-8 p-2')} href={'/'}>
                        <ArrowLeft className='size-7' />
                    </Link>
                    <div className="flex items-center gap-x-2">
                        <div className="font-semibold text-lg">
                            {jobDetails.title}
                        </div>
                        <GeneratePreviewJob jobID={jobDetails.id} organizationID={organization.value} />
                    </div>
                </div>
            </div>

            {!jobDetails.isPublished &&
                <div className="text-center bg-primary text-secondary text-xs py-2">
                    {(!jobDetails.isPublished && !jobDetails.isScheduled) &&
                        <>
                    This job isn&apos;t published
                        </>
                    }
                    {(!jobDetails.isPublished && jobDetails.isScheduled) &&
                        <>
                            This job is scheduled to be published on {format(new Date(jobDetails.dateStart!), 'yyyy-MM-dd')}
                        </>
                    }
                </div>
            }
            <div className="flex flex-1">
                <SidebarProvider>
                    <AppSidebar jobDetails={jobDetails} />
                    <SidebarInset className=''>
                        {children}
                    </SidebarInset>
                </SidebarProvider>
            </div>
        </div>
    );
}

export default JobLayout;