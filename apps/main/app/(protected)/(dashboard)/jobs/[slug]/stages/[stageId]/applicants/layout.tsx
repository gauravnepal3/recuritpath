
import { cookies } from 'next/headers'
import { prisma } from '@repo/database'
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@repo/ui/components/button';
import { SidebarInset, SidebarProvider } from '@repo/ui/components/sidebar';
import { AppSidebar } from './_components/app-sidebar';
interface ProtectedLayoutProps {
    children: React.ReactNode,
    params: Promise<{ slug: string, stageId: string }>
};

const getApplicantsByStage = async (stageID: string) => {
    return await prisma.jobStage.findFirst({
        where: {
            id: stageID
        }
    })
}
const StageLayout = async ({ children, params }: ProtectedLayoutProps) => {
    const cookieStore = await cookies()
    const organization = cookieStore.get('organization')
    if (!organization) {
        redirect('/organization/manage')
    }
    const stageID = (await params).stageId
    const applicantsByStage = await getApplicantsByStage(stageID)
    return (
        <div className="relative">
            <div className="flex z-10">
                <SidebarProvider
                    style={{
                        "--sidebar-width": "20rem",
                    } as React.CSSProperties}
                >
                    {applicantsByStage && <AppSidebar stageData={applicantsByStage} />}
                    <SidebarInset>
                        {children}
                    </SidebarInset>
                </SidebarProvider>
            </div>
        </div>
    );
}

export default StageLayout;