'use client'
import * as React from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    sidebarMenuButtonVariants,
    SidebarMenuItem,
} from "@repo/ui/components/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Tier } from "@aws-sdk/client-s3"
import { TierFeature } from "@/components/tier-feature"
import { Button, buttonVariants } from "@repo/ui/components/button"
import { cn } from "@repo/ui/lib/utils"

export function NavSecondary({
    items,
    ...props
}: {
    items: {
        title: string
        available: boolean
        icon: LucideIcon
        url: string
    }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    const pathName = usePathname()
    const censorName = (fullName: string): string => {
        return fullName
            .split(' ')
            .map(part => {
                if (part.length === 0) return '';
                const firstLetter = part[0];
                const stars = '*'.repeat(Math.max(part.length - 1, 0));
                return `${firstLetter}${stars}`;
            })
            .join(' ');
    };

    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>

                            {item.available ?
                                <SidebarMenuButton asChild isActive={pathName.includes(item.url)}>
                                <Link href={item.url}>
                                    <item.icon />
                                        <span>
                                            {item.title}</span>
                                    {pathName.includes(item.url) && <ChevronRight className="ml-auto" />}
                                    </Link>
                            </SidebarMenuButton>
                                :
                                <SidebarMenuButton asChild isActive={pathName.includes(item.url)}>
                                    <TierFeature>
                                        <Button
                                            variant={'ghost'}
                                            className={cn(sidebarMenuButtonVariants({ variant: "default" }), 'flex justify-start')}
                                        >
                                            <item.icon />
                                            <span>
                                                {item.available ? item.title : censorName(item.title)}</span>
                                            {pathName.includes(item.url) && <ChevronRight className="ml-auto" />}
                                        </Button>
                                    </TierFeature>
                                </SidebarMenuButton>

                            }
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
