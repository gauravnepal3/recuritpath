
import { prisma } from '@repo/database'
import { currentUser } from "@/lib/auth";
import { candidateAccessScope } from "@/lib/organization";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@repo/ui/components/button';
import { SidebarInset, SidebarProvider } from '@repo/ui/components/sidebar';
import { AppSidebar } from './_components/app-sidebar';
import { ScrollArea } from '@repo/ui/components/scroll-area';
interface ProtectedLayoutProps {
    children: React.ReactNode,
    params: Promise<{ slug: string, stageId: string, candidateId: string }>
};

const getApplicantData = async (candidateID: string, userID: string) => {
    return await prisma.candidateApplication.findFirst({
        where: {
            id: candidateID,
            ...candidateAccessScope(userID),
        },
        select: {
            id: true,
            createdAt: true,
            jobPost: {
                include: {
                    jobStage: {
                        select: {
                            id: true,
                            name: true,
                            jobId: true,
                            displayOrder: true
                        }
                    }
                }
            },
            formResponses: true
        }
    })
}
const StageLayout = async ({ children, params }: ProtectedLayoutProps) => {
    const user = await currentUser()
    if (!user?.id) {
        redirect('/auth/login')
    }
    const stageID = (await params).stageId
    const candidateID = (await params).candidateId
    const jobID = (await params).slug
    const applicantData = await getApplicantData(candidateID, user.id)
    return (
        <div className="relative">
            <div className="flex z-10">
                <SidebarProvider
                    style={{
                        "--sidebar-width": "18rem",
                    } as React.CSSProperties}
                >
                    {applicantData && <AppSidebar
                        jobID={jobID}
                        userID={user.id}
                        candidateID={candidateID}
                        stageID={stageID}
                        applicantData={applicantData} />}
                    <SidebarInset>
                        <ScrollArea className='h-[calc(100vh-4rem)]'>
                            {children}
                        </ScrollArea>
                    </SidebarInset>
                </SidebarProvider>
            </div>
        </div>
    );
}

export default StageLayout;