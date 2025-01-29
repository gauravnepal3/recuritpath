"use client"
import * as React from "react"
import { type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@repo/ui/components/sidebar"
import Link from "next/link"

export function JobStages({
    items,
    ...props
}: {
    items: {
        title: string
        url: string
        icon: LucideIcon,
        candidateNo: number
    }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    const pathName = usePathname()
    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={pathName === item.url}>
                                <Link href={item.url}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                    <div className="ml-auto">
                                        {item.candidateNo}
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
