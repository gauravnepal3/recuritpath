import React from 'react'
import { generatePresignedUrl } from '@/lib/s3'
import { prisma } from '@repo/database'
import PDFReader from './_components/PDFReader'

const getCandidateDetails = async (candidateID: string) => {
    return await prisma.candidateApplication.findFirst({
        where: {
            id: candidateID
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
    const candidateId = (await params).candidateId
    const candidateData = await getCandidateDetails(candidateId)
    const resumeName = candidateData?.formResponses.find(x => x.label === "Resume")?.value
    const fileURL = await generatePresignedUrl(process.env.AWS_S3_BUCKET_NAME!, `uploads/${resumeName}`!)
    return (
        <div className='p-2 pt-7'>
            <div className="text-2xl pl-2 font-bold">Resume</div>
            <div className="mt-4 h-[calc(100vh-12rem)]"> {/* Adjusted height calculation */}
                <PDFReader url={fileURL} />
            </div>
        </div>
    )
}

export default Resume