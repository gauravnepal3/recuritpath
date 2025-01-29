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
import { Archive, Folder, Inbox, LifeBuoy, Send, Settings, User, User2Icon } from "lucide-react"
import { Separator } from "@repo/ui/components/separator"
import { JobPost, JobStage } from "@prisma/client"


export function AppSidebar({ stageData }: { stageData: JobStage }) {
    // This is sample data.
    const data = {
        navSecondary: [
            {
                title: "Gaurav Nepal",
                url: "#",
                icon: User,
            },
            {
                title: "John Doe",
                url: "#",
                icon: User,
            },
        ],
    }
    return (
        <Sidebar
            collapsible="none"
            className="border-r  border-t-0 bg-background"
        >
            <SidebarContent>
                <SidebarGroupLabel className="pl-3 pt-3 text-sm font-bold text-primary">{stageData.name}</SidebarGroupLabel>
                <NavSecondary items={data.navSecondary} />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
