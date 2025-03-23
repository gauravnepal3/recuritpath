'use client'
import { Copy } from "lucide-react"
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

import { Button } from "@repo/ui/components/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@repo/ui/components/dialog"
import { Textarea } from "@repo/ui/components/textarea"
import { toast } from "sonner"
import React from "react"
import { addComment } from "@/actions/jobs"
import { MultiSelect } from "@repo/ui/components/multi-select"
import { requestReview } from "@/actions/review"

const FormSchema = z.object({
    reviewer: z.string().array().min(1, {
        message: "Reviewer must be at least 1 character.",
    })

})

export function RequestReview({ userID, candidateID, jobID, userEmails }: { userID: string, candidateID: string, jobID: string, userEmails: string[] }) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })
    const [open, setOpen] = React.useState<boolean>(false);
    const [selectedReviewer, setSelectedReviewer] = React.useState<string[]>([]);

    function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            const promise = requestReview({ userID: userID, candidateID: candidateID, reviewer: data.reviewer, jobID: jobID })
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
            setOpen(false)
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={'secondary'} className='text-xs font-normal'>
                    Request review
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Request Review</DialogTitle>
                    <DialogDescription>Only organization member can be requested for review.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="">
                        <FormField
                            control={form.control}
                            name="reviewer"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="space-y-1 text-xs">Reviewer
                                    </FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={userEmails.map((email) => ({ label: email, value: email }))}
                                            onValueChange={(value) => { form.setValue('reviewer', value) }}
                                            defaultValue={selectedReviewer}
                                            placeholder="Select emails"
                                            variant="default"
                                            animation={2}
                                            maxCount={8}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="mt-5">
                            <Button className="w-full" type="submit">Submit</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
