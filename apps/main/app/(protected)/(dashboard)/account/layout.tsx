import { SidebarInset, SidebarProvider } from '@repo/ui/components/sidebar'
import React from 'react'
import { AppSidebar } from './_components/app-sidebar'
import { ScrollArea } from '@repo/ui/components/scroll-area'
import { Bell } from 'lucide-react'
interface ProtectedLayoutProps {
    children: React.ReactNode,
    params: Promise<{ slug: string, stageId: string, candidateId: string }>
};
const layout = async ({ children, params }: ProtectedLayoutProps) => {
    return (
        <div className="relative">
            <div className="flex z-10">
                <SidebarProvider
                    style={{
                        "--sidebar-width": "18rem",
                    } as React.CSSProperties}
                >
                    <AppSidebar
                    />
                    <SidebarInset>
                        <div className="border-b py-2">
                            <div className="ml-auto mr-3 my-auto grid place-items-center w-8 h-8">
                                <Bell className='size-4' />
                            </div>
                        </div>
                        <ScrollArea className='h-[calc(100vh-4rem)]'>
                            {children}
                        </ScrollArea>
                    </SidebarInset>
                </SidebarProvider>
            </div>
        </div>
    )
}

export default layout