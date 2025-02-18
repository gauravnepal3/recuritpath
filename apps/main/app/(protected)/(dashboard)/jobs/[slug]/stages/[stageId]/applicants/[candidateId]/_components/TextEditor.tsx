'use client'
import React from 'react'
import { useState } from 'react'
import { Content } from '@tiptap/react'
import { MinimalTiptapEditor } from '@repo/ui/components/minimal-tiptap/minimal-tiptap'
import { Button } from '@repo/ui/components/button'
import { updateJobDescription } from '@/actions/jobs'
import { toast } from 'sonner'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@repo/ui/components/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/components/select"
import Link from 'next/link'
import { addReview } from '@/actions/review'

const FormSchema = z.object({
    position: z
        .string({
            required_error: "Please select you position on candidate.",
        }),
})
const TextEditor = ({ jobID, userID, candidateID, setOpen }: { userID: string, jobID: string, candidateID: string, setOpen: Function }) => {
    const [value, setValue] = useState<Content>('')
    const [loading, setLoading] = useState<boolean>(false);
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })
    function onSubmit(data: z.infer<typeof FormSchema>) {
        setLoading(true);
        try {
            const promise = addReview({ userID: userID, candidateID: candidateID, jobID: jobID, review: value as string, verdict: data.position })
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
                        setOpen(false)
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
            className="h-full pb-3"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex relative flex-col h-full">
                    {/* Review Editor - Takes Full Available Height */}
                    <div className="flex-grow">
                        <MinimalTiptapEditor
                            value={value}
                            injectCSS={false}
                            onChange={setValue}
                            className="w-full h-full border focus:border border-t-0 rounded-none drop-shadow-none"
                            editorContentClassName="p-5"
                            output="html"
                            placeholder="Type your review here..."
                            autofocus={false}
                            editable={true}
                            editorClassName="focus:outline-none !h-full"
                        />
                    </div>

                    {/* Fixed Verdict and Submit Section */}
                    <div className="bottom-0 left-0 right-0 pr-4 bg-white">
                        <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your verdict?</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select your position" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Strong Yes">Strong Yes</SelectItem>
                                            <SelectItem value="Yes">Yes</SelectItem>
                                            <SelectItem value="No">No</SelectItem>
                                            <SelectItem value="Strong No">Strong No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button className='mt-3' type="submit">Submit</Button>
                    </div>
                </form>
            </Form>

        </div>


    )
}

export default TextEditor