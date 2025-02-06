import React from 'react'
import JobPreview from './_components/JobPreview';
import JobDetailsPages from './_components/JobDetailsPages';
import { GoogleReCaptchaContext } from 'react-google-recaptcha-v3';

const JobDetails =
    async ({
        params,
        searchParams,
    }: {
        params: Promise<{ slug: string, jobID: string }>,
        searchParams: Promise<{
            [key: string]: string | string[] | undefined
        }>;
    }) => {
        const slug = (await params).slug
        const jobID = (await params).jobID
        const { preview } = await searchParams
        const isPreview = slug === "preview"
        if (isPreview) {
            return (
                // <GoogleReCaptchaContext>
                <JobPreview previewID={preview as string} jobID={jobID} />
                // </GoogleReCaptchaContext>
            )
        }
        return (
            <JobDetailsPages jobID={slug} />
        )
    }

export default JobDetails