import { Navbar } from "../_components/navbar";
import { AppSidebar } from "../_components/app-sidebar"
import { cookies } from 'next/headers'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb"
import { Separator } from "@repo/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@repo/ui/components/sidebar"
import { prisma } from '@repo/database'
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOrganizationTier } from "@/lib/subscription";
interface ProtectedLayoutProps {
  children: React.ReactNode;
};

const getOrganizationDetails = async (organizationID: string, userID: string, email: string) => {
  return prisma.organization.findFirst({
    where: {
      id: organizationID
    },
    include: {
      organizationRole: {
        where: {
          email: email
        },
        select: {
          role: true
        }
      }
    }
  })

}

const ProtectedLayout = async ({ children }: ProtectedLayoutProps) => {
  const user = await currentUser()
  const cookieStore = await cookies()
  const organization = cookieStore.get('organization')
  const organizationTier = await getOrganizationTier()
  if (!organization) {
    redirect('/organization/manage')
  }
  const organizationDetails = await getOrganizationDetails(organization.value, user?.id ?? '', user.email ?? '')
  if (!organizationDetails) {
    redirect('/organization/manage')
  }
  return (
    <div className="w-full max-h-screen overflow-hidden">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "50px",
          } as React.CSSProperties
        }
      >
        <AppSidebar user={user} organizationTier={organizationTier} organizationDetails={organizationDetails} />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default ProtectedLayout;