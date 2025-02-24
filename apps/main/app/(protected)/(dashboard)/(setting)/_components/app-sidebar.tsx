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
        }[],
        candidateApplication: {
            id: string,
            stageId: string
        }[]
    }
}

export function AppSidebar() {
    // This is sample data.
    return (
        <Sidebar
            collapsible="none"
            className="border-r bg-background"
        >
            <SidebarContent>
                <NavSecondary />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
