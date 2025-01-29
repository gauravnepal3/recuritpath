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
import { JobPost } from "@prisma/client"
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

export function AppSidebar({ jobId }: { jobId: string }) {
    // This is sample data.
    const data = {
        navSecondary: [
            {
                title: "Job details",
                url: `/jobs/${jobId}/setting`,
            },
            {
                title: "Job description",
                url: `/jobs/${jobId}/setting/description`,
            },
            {
                title: "Job Application",
                url: `/jobs/${jobId}/setting/application`
            },
            {
                title: "Hiring stages",
                url: `/jobs/${jobId}/setting/stages`,
            },
            {
                title: "Automation",
                url: `/jobs/${jobId}/setting/automation`,
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
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
