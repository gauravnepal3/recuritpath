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
const font = Poppins({
  subsets: ["latin"],
  weight: ["600"]
})

const getJobDetails = async (userID: string, organizationID: string) => {
  return await prisma.jobPost.findMany({
    where: {
      organizationId: organizationID
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
                <Link href={`/jobs/${x.id}/setting`} key={x.id} className="w-full flex items-center justify-between rounded-lg px-3 py-4 border hover:border-primary">
                  <div className="">
                    <div className="font-bold">
                      {x.title}
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
