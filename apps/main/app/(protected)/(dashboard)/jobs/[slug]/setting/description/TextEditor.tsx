'use client'
import React from 'react'
import { useState } from 'react'
import { Content } from '@tiptap/react'
import { MinimalTiptapEditor } from '@repo/ui/components/minimal-tiptap/minimal-tiptap'
import { Button } from '@repo/ui/components/button'
import { updateJobDescription } from '@/actions/jobs'
import { toast } from 'sonner'

const TextEditor = ({ jobDetails, userID }: { userID: string, jobDetails: { id: string, description: string | null, organizationId: string } }) => {
    const [value, setValue] = useState<Content>(jobDetails.description)
    const [loading, setLoading] = useState<boolean>(false);
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const promise = updateJobDescription({ userID: userID, jobID: jobDetails.id, description: value as string, organizationID: jobDetails.organizationId })
            toast.promise(
                promise.then((response) => {
                    // Check the custom response type
                    if (response.type === "ERROR") {
                        throw new Error(response.message); // Throw error to trigger the `error` toast
                    }
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
        } finally {
            setLoading(false)
        }
    }
    return (
        <div
            className="min-h-72"
        >

            <div className="w-full">
                <MinimalTiptapEditor
                    value={value}
                    injectCSS={false}
                    onChange={setValue}
                    className="w-full"
                    editorContentClassName="p-5"
                    output="html"
                    placeholder="Type your description here..."
                    autofocus={false}
                    editable={true}
                    editorClassName="focus:outline-none"
                />
            </div>
            <Button
                onClick={() => handleSubmit()}
                className="mt-4 ml-5"
            >
                Save
            </Button>
        </div>


    )
}

export default TextEditor