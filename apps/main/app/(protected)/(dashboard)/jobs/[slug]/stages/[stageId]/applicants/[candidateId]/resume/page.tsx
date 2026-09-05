import React from 'react'
import { generatePresignedUrl } from '@/lib/s3'
import { prisma } from '@repo/database'
import { currentUser } from '@/lib/auth'
import { candidateAccessScope } from '@/lib/organization'
import { redirect } from 'next/navigation'
import PDFReader from './_components/PDFReader'

const getCandidateDetails = async (candidateID: string, userID: string) => {
    return await prisma.candidateApplication.findFirst({
        where: {
            id: candidateID,
            ...candidateAccessScope(userID),
        },
        include: {
            formResponses: true
        }
    })
}
const Resume = async ({
    params,
}: {
    params: Promise<{ slug: string, candidateId: string }>
}) => {
    const user = await currentUser()
    if (!user?.id) {
        redirect('/auth/login')
    }
    const candidateId = (await params).candidateId
    const candidateData = await getCandidateDetails(candidateId, user.id)
    const resumeName = candidateData?.formResponses.find(x => x.label === "Resume")?.value
    // Out-of-scope candidate or no resume on file — never sign a URL for a
    // key we cannot attribute to this user's organization.
    if (!resumeName) {
        return (
            <div className='p-2 pt-7'>
                <div className="text-2xl w-full pl-2 font-bold">Resume</div>
                <div className="mt-4 pl-2 text-sm text-muted-foreground">No resume available.</div>
            </div>
        )
    }
    const fileURL = await generatePresignedUrl(process.env.AWS_S3_BUCKET_NAME!, `uploads/${resumeName}`)
    return (
        <div className='p-2 pt-7'>
            <div className="text-2xl w-full pl-2 font-bold">Resume</div>
            <div className="mt-4 w-full h-[calc(100vh-12rem)]"> {/* Adjusted height calculation */}
                <PDFReader url={fileURL} />
            </div>
        </div>
    )
}

export default Resume