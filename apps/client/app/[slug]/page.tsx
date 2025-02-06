import React from 'react'
import PreviewPage from './_components/PreviewPage';
import Organization from './_components/Organization';


const LandingPage = async ({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{
        [key: string]: string | string[] | undefined
    }>;
}) => {

    const slug = (await params).slug
    const { preview } = await searchParams
    const isPreview = slug === "preview"
    if (isPreview) {
        return (<PreviewPage previewID={preview as string} />)
    }
    return (
        <Organization organizationName={slug} />
    )
}

export default LandingPage