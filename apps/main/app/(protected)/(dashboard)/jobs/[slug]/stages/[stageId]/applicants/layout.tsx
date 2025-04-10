
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
import { getOrganizationTier } from '@/lib/subscription';
import { Metadata } from 'next';
interface ProtectedLayoutProps {
    children: React.ReactNode,
    params: Promise<{ slug: string, stageId: string }>
};
export const metadata: Metadata = {
    title: 'Candidates | Requro',
}

const getApplicantsByStage = async (stageID: string, jobID: string) => {
    const allCandidates = await prisma.candidateApplication.findMany({
        where: {
            jobId: jobID,
        },
        select: {
            id: true,
            stageId: true,
            jobStage: {
                select: {
                    name: true,
                }
            },
            formResponses: {
                select: {
                    id: true,
                    label: true,
                    value: true,
                },
            },
        },
        orderBy: {
            createdAt: 'asc',
        },
    });

    const organizationTier = await getOrganizationTier();
    if (!allCandidates || allCandidates.length === 0) {
        return {
            name: '',
            candidateStage: [],
        };
    }

    // Add availability flag globally based on Free tier
    const candidatesWithAvailability = allCandidates.map((candidate, index) => ({
        ...candidate,
        available: organizationTier === "Free" ? index < 2 : true,
    }));


    const candidatesInStage = candidatesWithAvailability.filter(
        (candidate) => candidate.stageId === stageID
    );

    if (candidatesInStage.length === 0) {
        return {
            name: '',
            candidateStage: [],
        };
    }

    return {
        name: candidatesInStage[0]?.jobStage?.name || '',
        candidateStage: candidatesInStage.map((candidate) => ({
            id: candidate.id,
            stageId: candidate.stageId,
            available: candidate.available,
            formResponses: candidate.formResponses,
        })),
    };
};


const StageLayout = async ({ children, params }: ProtectedLayoutProps) => {
    const cookieStore = await cookies()
    const organization = cookieStore.get('organization')
    if (!organization) {
        redirect('/organization/manage')
    }
    const stageID = (await params).stageId
    const jobID = (await params).slug
    const applicantsByStage = await getApplicantsByStage(stageID, jobID)
    return (
        <div className="relative">
            <div className="flex z-10">
                <SidebarProvider
                    style={{
                        "--sidebar-width": "15rem",
                    } as React.CSSProperties}
                >
                    {applicantsByStage && <AppSidebar jobID={jobID} applicantsData={applicantsByStage} />}
                    <SidebarInset>
                        {children}

                    </SidebarInset>
                </SidebarProvider>
            </div>
        </div>
    );
}

export default StageLayout;