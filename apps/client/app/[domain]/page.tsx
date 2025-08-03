import React from 'react'
import PreviewPage from './_components/PreviewPage';
import Organization from './_components/Organization';
import { prisma } from '@repo/database'
import Link from 'next/link';
import { Badge } from '@repo/ui/components/badge';
import { User } from 'lucide-react';
import OrganizationNavbar from '@/components/organization-navbar';
const getDetailsByDomain = async (domain: string) => {
    const rootDomain = process.env.NEXT_PUBLIC_CLIENT_URL?.replace(/^https?:\/\//, '') ?? "localhost:3000";

    let assignedDomain: string | null = null;

    if (domain.endsWith(`.${rootDomain}`)) {
      assignedDomain = domain.slice(0, -(rootDomain.length + 1)); // +1 for the dot
  }

    console.log("Requested Domain:", domain);
    console.log("Root Domain:", rootDomain);
    console.log("Assigned Domain:", assignedDomain);
    console.log("Custom Domain:", domain);

    const orConditions: { assignedDomain?: string; customDomain?: string }[] = [];

    if (assignedDomain) {
        orConditions.push({ assignedDomain });
    }

    orConditions.push({ customDomain: domain });

    return await prisma.organization.findFirst({
        where: {
          OR: orConditions
      },
      include: {
          jobPost: true
      }
  });
};

const LandingPage = async ({
    params,
    searchParams,
}: {
    params: Promise<{ domain: string }>,
    searchParams: Promise<{
        [key: string]: string | string[] | undefined
    }>;
}) => {
    const domain = decodeURIComponent((await params).domain);
    const { preview } = await searchParams
    const isPreview = domain === "preview"
    if (isPreview) {
        return (<PreviewPage previewID={preview as string} />)
    }
    const organizationDetails = await getDetailsByDomain(domain)
    const jobDetails = organizationDetails?.jobPost.filter(x => x.isPublished)
    return (
        <div className='max-w-screen-lg mx-auto'>
            <OrganizationNavbar organizationName={organizationDetails?.name} organizationLogo={organizationDetails?.logo} organizationURL={organizationDetails?.url} />
            {(!jobDetails || jobDetails?.length === 0) ?
                <div className='text-center mt-4'>
                    <span className='text-xs text-muted-foreground pt-4'>No jobs available</span>
                </div> : <div className='flex-col space-y-5'>
                    {jobDetails.map(x => (
                        <Link href={`/${x.id}`} key={x.id} className="w-full mt-5 flex items-center justify-between rounded-lg px-3 py-4 border hover:bg-sidebar-accent">
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
                            </div>
                        </Link>
                    ))}
                </div>
            }
        </div>
    )
}

export default LandingPage