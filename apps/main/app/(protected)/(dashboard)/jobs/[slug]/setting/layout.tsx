
import { prisma } from '@repo/database'
import { currentUser } from "@/lib/auth";
import { requireActiveOrganization } from "@/lib/organization";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@repo/ui/components/button';
import { SidebarGroupLabel, SidebarInset, SidebarProvider } from '@repo/ui/components/sidebar';
import { AppSidebar } from './_components/app-sidebar';
import { ScrollArea, ScrollBar } from '@repo/ui/components/scroll-area';
interface ProtectedLayoutProps {
    children: React.ReactNode,
    params: Promise<{ slug: string }>
};

const getJobDetails = async (jobID: string, organizationId: string) => {
    return await prisma.jobPost.findFirst({
        where: {
            id: jobID,
            organizationId
        }
    })
}
const SettingLayout = async ({ children, params }: ProtectedLayoutProps) => {
    const user = await currentUser()
    const { organizationId } = await requireActiveOrganization()
    const jobId = (await params).slug
    const jobDetails = await getJobDetails(jobId, organizationId)
    if (!jobDetails) {
        redirect('/')
    }
    return (
        <div className="relative">
            <div className="flex z-10">
                <SidebarProvider
                    style={{
                        "--sidebar-width": "18rem",
                    } as React.CSSProperties}
                >
                    <AppSidebar jobDetails={jobDetails} organizationID={organizationId} userID={user.id} jobId={jobId} />
                    <SidebarInset className=''>
                        <ScrollArea className='h-[calc(100vh-4rem)]'>
                            {children}
                        </ScrollArea>
                    </SidebarInset>
                </SidebarProvider>
            </div>
        </div>
    );
}

export default SettingLayout;