import { Poppins } from "next/font/google";
import { cookies } from 'next/headers'
import { cn } from "@/lib/utils";
import { Button } from "@repo/ui/components/button";
import { LoginButton } from "@/components/auth/login-button";
import { redirect } from 'next/navigation'
import { currentUser } from "@/lib/auth";
import Link from "next/link";
import { AddJobDialog } from "../_components/AddJobDialog";
import { prisma } from "@repo/database"
import { Badge } from "@repo/ui/components/badge";
import { Inbox, User } from "lucide-react";
import { Metadata } from "next";
const font = Poppins({
  subsets: ["latin"],
  weight: ["600"]
})

export const metadata: Metadata = {
  title: 'Dashboard | Requro',
}
const getJobDetails = async (userID: string, organizationID: string) => {
  return await prisma.jobPost.findMany({
    where: {
      organizationId: organizationID,
    },
    include: {
      candidateApplication: {
        select: {
          _count: true,
          jobStage: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  })
}

export default async function Home() {
  const user = await currentUser()
  if (!user?.id) {
    redirect('/auth/login');
  }
  const cookieStore = await cookies()
  const activeOrganization = cookieStore.get('organization')

  if (!activeOrganization) {
    redirect('/organization/manage')
  }

  const jobDetails = await getJobDetails(user?.id, activeOrganization.value)
  return (
    <main>
      <div className="container mx-auto mt-3 max-w-screen-md">
        <div className="flex justify-between border-b pb-3 items-center">
          <div className="">Jobs</div>
          <AddJobDialog userID={user?.id!} organizationID={activeOrganization.value} />
        </div>
        <div className="mt-3">
          {jobDetails.length === 0 ?
            <div className='text-center'>
              <span className='text-xs text-muted-foreground'>No Jobs</span>
            </div> : <div className='flex-col space-y-5'>
              {jobDetails.map(x => (
                <Link href={`/jobs/${x.id}/setting`} key={x.id} className="w-full flex items-center justify-between rounded-lg px-3 py-4 border hover:bg-sidebar-accent">
                  <div className="grid grid-cols-3 gap-x-2 w-full h-full">
                    <div className="col-span-2">
                      <div className="font-bold">
                        {x.title}
                      </div>
                      <div className="mt-4">
                        {x.country &&
                          <Badge variant={'outline'}>
                            {x.country?.split('/')[0]}
                          </Badge>
                        }
                      </div>
                    </div>
                    <div className="col-span-1 border-l-2 flex flex-col space-y-2">
                      <div className="flex gap-x-2 text-xs items-center justify-center text-muted-foreground">
                        <User className="size-4" />
                        Total
                        <span>
                          {x.candidateApplication.length}
                        </span>
                      </div>
                      <div className="flex gap-x-2 text-xs items-center justify-center text-muted-foreground">
                        <Inbox className="size-4" />
                        Inbox
                        <span>
                          {x.candidateApplication.filter(x => x.jobStage.name === "Inbox").length}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          }
        </div>
      </div>
    </main>
  )
}
