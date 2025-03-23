
import { cookies } from 'next/headers'
import { prisma } from '@repo/database'
import { currentUser } from "@/lib/auth";
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

const getJobDetails = async (jobID: string) => {
    return await prisma.jobPost.findFirst({
        where: {
            id: jobID
        }
    })
}
const SettingLayout = async ({ children, params }: ProtectedLayoutProps) => {
    const cookieStore = await cookies()
    const user = await currentUser()
    const organization = cookieStore.get('organization')
    const jobId = (await params).slug
    if (!organization) {
        redirect('/organization/manage')
    }
    const jobDetails = await getJobDetails(jobId)
    return (
        <div className="relative">
            <div className="flex z-10">
                <SidebarProvider
                    style={{
                        "--sidebar-width": "18rem",
                    } as React.CSSProperties}
                >
                    <AppSidebar jobDetails={jobDetails} organizationID={organization.value} userID={user.id} jobId={jobId} />
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