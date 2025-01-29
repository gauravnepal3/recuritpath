
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
interface ProtectedLayoutProps {
    children: React.ReactNode,
    params: Promise<{ slug: string }>
};

const getJobDetails = async (organizationID: string, userID: string, jobID: string) => {
    return prisma.jobPost.findFirst({
        where: {
            id: jobID
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
                    <div className="font-semibold text-lg">
                        {jobDetails.title}
                    </div>
                    <div className="ml-auto mr-3">
                        <Bell className='size-4'></Bell>
                    </div>
                </div>
            </div>
            {!jobDetails.isPublished &&
                <div className="text-center bg-primary text-secondary text-xs py-2">
                    This job isn&apos;t published
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