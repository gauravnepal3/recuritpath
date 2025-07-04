'use client'
import * as React from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@repo/ui/components/sidebar"
import Link from "next/link"

export function NavSecondary({
    items,
    ...props
}: {
    items: {
        title: string
        url: string
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
                                    <span>{item.title}</span>
                                    {pathName === item.url && <ChevronRight className="ml-auto" />}

                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
