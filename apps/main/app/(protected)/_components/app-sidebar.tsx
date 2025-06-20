"use client"

import * as React from "react"
import { ArchiveX, Command, File, Inbox, Send, Settings, Trash2 } from "lucide-react"

import { NavUser } from "./nav-bar"
import { Label } from "@repo/ui/components/label"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@repo/ui/components/sidebar"
import { Switch } from "@repo/ui/components/switch"
import Link from "next/link"
import { currentUser } from "@/lib/auth"
// Define ExtendedUser type locally or import it from the correct module
interface ExtendedUser {
    name?: string;
    email?: string;
    image?: string;
}
import { UserRole } from "@repo/database"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@repo/ui/components/button"


interface AppSidebarProps {

    user: (ExtendedUser & { role: UserRole; isTwoFactorEnabled: boolean; isOAuth: boolean; }) | undefined;
    organizationDetails: any,
    organizationTier: string
}
// This is sample data
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
}

export function AppSidebar({ user, organizationDetails, organizationTier }: AppSidebarProps) {
    // Note: I'm using state to show active item.
    // IRL you should use the url/router.
    const { setOpen } = useSidebar()
    return (
        <Sidebar
            collapsible="icon"
            className="overflow-hidden"
        // {...props}
        >
            <Sidebar
                collapsible="none"
                className="!w-[calc(var(--sidebar-width-icon)_+_1px)]"
            >
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                                <Link href="/organization/manage">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                        {`${Array.from(organizationDetails.name)[0]}`}
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{organizationDetails.name}</span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                </SidebarContent>
                <SidebarFooter>
                    <Link className={cn(buttonVariants({ variant: 'ghost' }), 'mb-3 cursor-pointer')} href="/organization/setting">
                        <Settings className="w-5 h-5" width={20} height={20} />
                    </Link>
                    <NavUser organizationTier={organizationTier} user={user ? { email: user.email ?? "", avatar: user.image ?? "", name: user.name ?? "" } : data.user} />
                </SidebarFooter>
            </Sidebar>
        </Sidebar>
    )
}
