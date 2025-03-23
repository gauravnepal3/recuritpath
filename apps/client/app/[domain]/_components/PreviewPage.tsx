import React from 'react'
import { prisma } from '@repo/database'
import { Badge } from '@repo/ui/components/badge'
import Link from 'next/link'
const getPreviewDetails = async (previewID: string) => {
    return await prisma.jobPreview.findFirst({
        where: {
            id: previewID
        },
        include: {
            organization: {
                select: {
                    id: true,
                    logo: true,
                    name: true,
                    jobPost: true
                }
            }
        }
    })
}
const PreviewPage = async ({ previewID }: { previewID: string }) => {
    const previewDetails = await getPreviewDetails(previewID)
    if (previewDetails?.expiresAt && new Date(previewDetails.expiresAt) > new Date()) {
        return (
            <div className='max-w-screen-lg mx-auto'>
                <div className="border-b py-4 ">
                    {previewDetails.organization?.name}
                </div>
                <div className="mt-5">
                    {previewDetails.organization?.jobPost.map((x, index) => (
                        <Link href={`/preview/${x.id}?preview=${previewID}`} className="" key={index}>
                            <div className="border hover:border-primary p-4 rounded-lg">

                                <div className="text-lg font-semibold">
                                    {x.title}
                                </div>
                                <div className="flex gap-x-2 mt-3">
                                    <div className="">
                                        {x.country?.split('/')[0] &&
                                            <Badge>
                                                {x.country?.split('/')[0]}
                                            </Badge>
                                        }
                                    </div>
                                    <div className="">
                                        {x.remoteOption &&
                                            <Badge>
                                                {x.remoteOption}
                                            </Badge>
                                        }
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )
    } else {
        return (
            <div>Preview has expired</div>
        )
    }
}

export default PreviewPage