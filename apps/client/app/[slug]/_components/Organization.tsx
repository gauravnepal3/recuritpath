import React from 'react'

import { prisma } from '@repo/database'
const getOrganizationDetails = async (organizationName: string) => {
    return await prisma.organization.findFirst({
        where: {
            name: organizationName
        },
        include: {
            jobPost: true
        }
    })
}

const Organization = async ({ organizationName }: { organizationName: string }) => {
    const organizationDetails = await getOrganizationDetails(organizationName)

    return (
        <div className='max-w-screen-lg mx-auto'>
            <div className="border-b ">
                {organizationDetails?.name}
            </div>
            <div className="">
                {organizationDetails?.jobPost.map((x, index) => (
                    <div className="" key={index}>
                        {x.title}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Organization