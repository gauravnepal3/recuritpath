'use client'
import { SidebarMenuButton, SidebarMenuItem } from "@repo/ui/components/sidebar"
import { type LucideIcon, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from 'react'

const MenuItem = ({ item }: {
    item: {
        title: string
        url: string
        icon: LucideIcon
    }
}) => {
    const pathName = usePathname()
    return (
        <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={pathName === (item.url)}>
                <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                    {pathName === (item.url) && <ChevronRight className="ml-auto" />}
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}

export default MenuItem