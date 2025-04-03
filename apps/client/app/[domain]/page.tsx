import React from 'react'
import PreviewPage from './_components/PreviewPage';
import Organization from './_components/Organization';
import { prisma } from '@repo/database'
import Link from 'next/link';
import { Badge } from '@repo/ui/components/badge';
import { User } from 'lucide-react';
const getDetailsByDomain = async (domain: string) => {
    return await prisma.organization.findFirst({
        where: {
            OR: [
                {
                    assignedDomain: domain.split(`.${process.env.NEXT_PUBLIC_CLIENT_URL}`)[0],
                },
                {
                    customDomain: domain
                }
            ],

        },
        include: {
            jobPost: true
        }
    })
}
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
            <div className="border-b py-3">
                {organizationDetails?.name}
            </div>
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