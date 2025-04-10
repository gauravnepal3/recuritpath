"use client"
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
import React from "react"
import { z } from "zod"
import { moveToStage } from "@/actions/jobs"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { DropdownMenuItem } from "@repo/ui/components/dropdown-menu"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form"
import { Checkbox } from "@repo/ui/components/checkbox"
import Link from "next/link"
const FormSchema = z.object({
    sendEmail: z.boolean().default(false).optional(),
})
export function ArchiveCandidate({ jobStages, userID, candidateID, jobID }: { jobStages: { label: string, value: string }[], userID: string, candidateID: string, jobID: string }) {
    const [open, setOpen] = React.useState<boolean>(false)
    const router = useRouter()
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            sendEmail: true,
        },
    })
    function onSubmit(values: z.infer<typeof FormSchema>) {
        try {
            try {
                const archiveID = jobStages.find(x => x.label === "Archived")?.value ?? ''
                const promise = moveToStage({ userID: userID, candidateID: candidateID, stageID: jobStages.find(x => x.label === "Archived")?.value ?? '', confirmation: values.sendEmail })
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
                            router.push(`/jobs/${jobID}/stages/${archiveID}/applicants/${candidateID}`)
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
            }
        } catch (error) {
            console.error("Form submission error", error);
            toast.error("Failed to submit the form. Please try again.");
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Archive</DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share link</DialogTitle>
                    <DialogDescription>
                        Anyone who has this link will be able to view this.
                    </DialogDescription>
                </DialogHeader>
                <div className="">

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="sendEmail"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 ">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Send Email Notification
                                            </FormLabel>
                                            <FormDescription>
                                                An rejection email will be sent to the candidate.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
