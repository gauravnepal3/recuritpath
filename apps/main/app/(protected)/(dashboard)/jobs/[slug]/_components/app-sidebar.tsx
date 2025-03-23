"use client"
import * as React from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@repo/ui/components/sidebar"
import { NavSecondary } from "./nav-secondary"
import { Archive, BrainCircuit, Folder, Inbox, LifeBuoy, Send, Settings } from "lucide-react"
import { JobStages } from "./job-stages"
import { Separator } from "@repo/ui/components/separator"
import { JobPost } from "@prisma/client"
interface AppSidebarProps {

    jobDetails: JobPost &
    {
        jobStage: {
            id: string,
            name: string,
            displayOrder: number,
            isDeletable: boolean
        }[],
        candidateApplication: {
            id: string,
            stageId: string
        }[]
    }
}

export function AppSidebar({ jobDetails }: AppSidebarProps) {
    // This is sample data.
    const data = {
        jobStages: jobDetails.jobStage
            .map(x => ({
                title: x.name,
                url: `/jobs/${jobDetails.id}/stages/${x.id}/applicants`,
                icon: x.name === "Inbox" ? Inbox : x.name === "Archived" ? Archive : Folder,
                candidateNo: jobDetails.candidateApplication.filter(candidate => candidate.stageId === x.id).length,
                dispalyOrder: x.displayOrder,
            }))
            .sort((a, b) => {
                // Custom sorting logic
                if (a.title === "Inbox") return -1; // Always place "Inbox" at the top
                if (b.title === "Inbox") return 1;

                if (a.title === "Archived") return 1; // Always place "Archived" at the last
                if (b.title === "Archived") return -1;

                if (a.title === "Hired") return 1; // Always place "Hired" second last
                if (b.title === "Hired") return -1;

                // For other items, follow the displayOrder
                return a.dispalyOrder - b.dispalyOrder;
            }),
        navSecondary: [
            {
                title: "Screening",
                url: `/jobs/${jobDetails.id}/screening`,
                icon: BrainCircuit,
            },
            {
                title: "Setting",
                url: `/jobs/${jobDetails.id}/setting`,
                icon: Settings,
            },
            {
                title: "Share",
                url: "#",
                icon: Send,
            },
        ],
    }
    return (
        <Sidebar
            collapsible="none"
            className="border-r bg-background"
        >
            <SidebarContent>
                <JobStages items={data.jobStages} />
                <Separator></Separator>
                <NavSecondary items={data.navSecondary} />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
