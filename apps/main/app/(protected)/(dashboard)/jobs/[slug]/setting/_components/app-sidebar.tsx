'use client'
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
import { Archive, Folder, Inbox, LifeBuoy, Send, Settings } from "lucide-react"
import { Separator } from "@repo/ui/components/separator"
import { JobPost } from "@repo/database"
import { JobPublishDialog } from "./JobPublishDialog"
interface AppSidebarProps {

    jobDetails: JobPost &
    {
        jobStage: {
            id: string,
            name: string,
            displayOrder: number,
            isDeletable: boolean
        }[]
    }
}

export function AppSidebar({ jobDetails, jobId, organizationID, userID }: { jobDetails: any, organizationID: string, userID: string, jobId: string }) {
    // This is sample data.
    const data = {
        navSecondary: [
            {
                title: "Job Details",
                url: `/jobs/${jobId}/setting`,
            },
            {
                title: "Job Description",
                url: `/jobs/${jobId}/setting/description`,
            },
            {
                title: "Job Application",
                url: `/jobs/${jobId}/setting/application`
            },
            {
                title: "Hiring Stages",
                url: `/jobs/${jobId}/setting/stages`,
            },
            {
                title: "Mailing Template",
                url: `/jobs/${jobId}/setting/mailing-templates`,
            },
        ],
    }
    return (
        <Sidebar
            collapsible="none"
            className="border-r  border-t-0 bg-background"
        >
            <SidebarContent>
                <SidebarGroupLabel className="pl-3 pt-3 text-sm font-bold text-primary">Setting</SidebarGroupLabel>
                <NavSecondary items={data.navSecondary} />
                <SidebarGroupLabel className="mt-3">
                    <JobPublishDialog jobDetails={jobDetails} userID={userID} organizationID={organizationID} jobID={jobId} />
                </SidebarGroupLabel>
            </SidebarContent>
            {/* <SidebarRail /> */}
        </Sidebar>
    )
}
