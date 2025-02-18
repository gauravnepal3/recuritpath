"use client"
import * as React from "react"
import { Bell, BriefcaseBusiness, ChevronRight, Clipboard, Globe, Home, User, type LucideIcon } from "lucide-react"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@repo/ui/components/sidebar"
import { getCurrentPath } from "@/actions/currentPath"
import Link from "next/link"
import MenuItem from "./MenuItem"
import { usePathname } from "next/navigation"
import { title } from "process"
export function NavSecondary({
    ...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    const pathname = usePathname()
    const items = [
        {
            icon: User,
            title: "Account",
            url: "/account"
        },
        {
            icon: Bell,
            title: "Notification",
            url: "/account/notifications"
        },
        {
            icon: BriefcaseBusiness,
            title: "Manage Organization",
            url: "/account/organization"
        },
        {
            icon: Globe,
            title: "Domains",
            url: "/account/domains"
        },
        {
            icon: Clipboard,
            title: "Billing",
            url: "/account/billing"
        }
    ]
    return (
        <SidebarGroup className="mt-11" {...props}>
            <SidebarGroupContent>
                <SidebarMenu className="my-auto">
                    {items.map(x => (
                        <MenuItem item={x} key={x.title}>
                        </MenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
