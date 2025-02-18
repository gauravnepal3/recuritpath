'use client'
import { Copy, Globe, Mail, Phone, Scroll } from "lucide-react"
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
import { Input } from "@repo/ui/components/input"
import { Label } from "@repo/ui/components/label"
import { Textarea } from "@repo/ui/components/textarea"
import { toast } from "sonner"
import React from "react"
import { addComment } from "@/actions/jobs"
import PDFReader from "./PDFReader"
import { ScrollArea } from "@repo/ui/components/scroll-area"
import { Badge } from "@repo/ui/components/badge"
import TextEditor from "./TextEditor"

const FormSchema = z.object({
    comment: z
        .string()
        .min(10, {
            message: "Comment must be at least 10 characters.",
        })
        .max(500, {
            message: "Comment must not be longer than 500 characters.",
        }),
})

type formResponseType = {
    id: string;
    candidateApplicationId: string;
    jobApplicationId: string;
    label: string;
    value: string | null;
    createdAt: Date;
    jobApplication: {
        questionType: String
    }
}

type jobPostType = {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    employmentType: string | null;
    country: string | null;
    city: string | null;
    remoteOption: string | null;
}

export function AddReview({ userID, candidateID, jobID, jobDetails, formResponse, resumeLink }: { userID: string, candidateID: string, jobID: string, formResponse: formResponseType[], jobDetails: jobPostType, resumeLink: string }) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })
    const additionQuestion = formResponse.filter(x => x.jobApplication.questionType === "Additional")
    const [open, setOpen] = React.useState<boolean>(false);
    function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            const promise = addComment({ userID: userID, candidateID: candidateID, comment: data.comment, jobID: jobID })
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
                    Add review
                </Button>
            </DialogTrigger>
            <DialogContent className="pb-5 p-0 overflow-hidden max-h-[90vh] rounded-none max-w-screen-xl [&>button:last-child]:hidden ">
                <div className="grid grid-cols-2 gap-x-5">
                    <div className="col-span-1 p-2">
                        <DialogTitle className="border-b pb-2">
                            <div className="text-2xl font-bold">
                                <span>
                                    {formResponse.find(x => x.label === "Name")?.value}
                                </span>
                                <span className="font-normal text-lg">
                                    {" "}  for {jobDetails.title}
                                </span>
                            </div>
                        </DialogTitle>
                        <ScrollArea className="max-h-[80vh] mt-3 overflow-y-auto">
                            <div className="flex gap-x-2">
                                <Badge className="text-muted-foreground flex gap-x-2" variant={'outline'}>
                                    <Mail className="size-4" />
                                    <span >
                                        {formResponse.find(x => x.label === "Email")?.value}
                                    </span>
                                </Badge>
                                <Badge className="text-muted-foreground flex gap-x-2" variant={'outline'}>
                                    <Phone className="size-4" />
                                    <span >
                                        {formResponse.find(x => x.label === "Phone Number")?.value}
                                    </span>
                                </Badge>
                                <Badge className="text-muted-foreground flex gap-x-2" variant={'outline'}>
                                    <Globe className="size-4" />
                                    <span >
                                        {formResponse.find(x => x.label === "Location")?.value}
                                    </span>
                                </Badge>
                            </div>
                            <div className="border my-2 rounded">
                                {additionQuestion.length === 0 ?
                                    <>
                                        No question response to show
                                    </> : <div className="text-xs p-4">
                                        {additionQuestion.map(x => (
                                            <div key={x.id} className="mb-3">
                                                <div className="font-bold">
                                                    {x.label}
                                                </div>
                                                <div className="italic">
                                                    {x.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                }
                            </div>
                            <div className="">
                                <div className="text-lg font-semibold">Resume</div>
                                <div className="border p-2 rounded">
                                    <PDFReader url={resumeLink} />
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                    <div className="col-span-1 h-full">
                        <TextEditor setOpen={setOpen} userID={userID} candidateID={candidateID} jobID={jobID} />
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    )
}
