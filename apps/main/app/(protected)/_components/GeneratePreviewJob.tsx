'use client'
import { generatePreviewID } from '@/actions/jobs'
import { Button } from '@repo/ui/components/button'
import { ExternalLink } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
const GeneratePreviewJob = ({ organizationID, jobID }: { organizationID: string, jobID: string }) => {
    return (
        <Button variant={'link'} onClick={async () => {
            try {
                const promise = generatePreviewID(organizationID, jobID)
                toast.promise(
                    promise.then((response) => {
                        // Check the custom response type
                        if (response.type === "ERROR") {
                            throw new Error(response.message); // Throw error to trigger the `error` toast
                        }
                        window.open(`${process.env.NEXT_PUBLIC_CLIENT_URL}/preview?preview=${response.data?.id}`)
                        return response.message; // Success case, pass the message for the `success` toast
                    }),
                    {
                        loading: "Loading...",
                        success: (message) => {
                            return message; // Display the success message
                        },
                        error: (error) => error.message || "Something went wrong", // Show the error message
                    }
                );
            } catch (error) {
                console.error("Form submission error", error);
                toast.error("Failed to submit the form. Please try again.");
            }

        }} className='flex gap-x-1 text-xs text-muted-foreground'>
            <ExternalLink />
            Preview
        </Button>
    )
}

export default GeneratePreviewJob