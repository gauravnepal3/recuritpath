"use client"
import {
    useState
} from "react"
import {
    toast
} from "sonner"
import {
    useForm
} from "react-hook-form"
import {
    zodResolver
} from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    cn
} from "@/lib/utils"
import {
    Button,
    buttonVariants
} from "@repo/ui/components/button"
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
    SelectValue
} from "@repo/ui/components/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu"

import { JobApplication } from "@prisma/client"
import { updateDeleteStatusAdditionalQuestion, updateJobApplication } from "@/actions/jobs"
import { AdditionalQuestionDialog } from "./AdditionalQuestionDialog"
import { Badge } from "@repo/ui/components/badge"
import { EllipsisVertical } from "lucide-react"
import { UpdateQuestionDialog } from "./UpdateQuestionDialog"

const formSchema = z.object({
    name: z.string(),
    email: z.string(),
    location: z.string(),
    phoneNumber: z.string(),
    linkedIn: z.string(),
    github: z.string(),
    resume: z.string()
});

const fieldStatus = [
    'Required',
    'Optional',
    'Hidden'
]

export default function ApplicationFrom({ userID, jobID, jobApplicationFormData }: { jobApplicationFormData: JobApplication[], userID: string, jobID: string }) {
    const additionalQuestion = jobApplicationFormData.filter(x => x.questionType == "Additional")
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: jobApplicationFormData.find(x => x.label === "Name")?.rule,
            email: jobApplicationFormData.find(x => x.label === "Email")?.rule,
            location: jobApplicationFormData.find(x => x.label === "Location")?.rule,
            phoneNumber: jobApplicationFormData.find(x => x.label === "Phone Number")?.rule,
            github: jobApplicationFormData.find(x => x.label === "Github")?.rule,
            linkedIn: jobApplicationFormData.find(x => x.label === "LinkedIn")?.rule,
            resume: jobApplicationFormData.find(x => x.label === "Resume")?.rule
        }

    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const jobApplication = jobApplicationFormData.map(x => ({
                ...x,
                rule: values[x.label.toLowerCase().replace(" ", "") as keyof typeof values]
            }))
            const promise = updateJobApplication({ userID: userID, jobID: jobID, jobApplication: jobApplication })
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
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 pb-4">
                <div className="font-bold text-[15px] pt-8">Basic Information</div>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Name</FormLabel>
                            <Select disabled onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a verified email to display" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {fieldStatus.map((x, index) => (
                                        <SelectItem key={index} value={x}>{x}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Email</FormLabel>
                            <Select disabled onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a verified email to display" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {fieldStatus.map((x, index) => (
                                        <SelectItem key={index} value={x}>{x}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Location</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a verified email to display" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {fieldStatus.map((x, index) => (
                                        <SelectItem key={index} value={x}>{x}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Phone Number</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a verified email to display" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {fieldStatus.map((x, index) => (
                                        <SelectItem key={index} value={x}>{x}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="font-bold text-[15px] pt-8">Links</div>
                <FormField
                    control={form.control}
                    name="linkedIn"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-xs">LinkedIn</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a verified email to display" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {fieldStatus.map((x, index) => (
                                        <SelectItem key={index} value={x}>{x}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="github"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Github</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a verified email to display" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {fieldStatus.map((x, index) => (
                                        <SelectItem key={index} value={x}>{x}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="font-bold text-[15px] pt-8">Files</div>
                <FormField
                    control={form.control}
                    name="resume"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Resume</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a verified email to display" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {fieldStatus.map((x, index) => (
                                        <SelectItem key={index} value={x}>{x}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className=" pt-5">
                    <div className="flex justify-between">

                        <div className="font-bold text-[15px]">Custom Field</div>
                        <AdditionalQuestionDialog jobID={jobID} userID={userID} />

                    </div>
                    <FormLabel className="text-xs">Additional Questions</FormLabel>
                    {additionalQuestion.length === 0 ?
                        <div className="bg-sidebar min-h-4 rounded text-center text-muted-foreground text-xs border p-5">
                            No additional questions added
                        </div> : <>
                            <div className="bg-sidebar border mt-3 rounded overflow-hidden">

                                {additionalQuestion.map((x, index) => (
                                    <div key={x.id} className="p-3 border-b">
                                        <div className="flex justify-between">
                                            <div className="font-semibold">
                                                {x.label}
                                            </div>
                                            <div className="mr-3">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost' }))}>
                                                        {/* <Button variant={'ghost'}> */}
                                                        <EllipsisVertical />
                                                        {/* </Button> */}
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="right-2">
                                                        <UpdateQuestionDialog
                                                            userID={userID}
                                                            jobID={jobID}
                                                            data={x}
                                                        />
                                                        <DropdownMenuItem className="cursor-pointer" onClick={() => {
                                                            try {
                                                                const promise = updateDeleteStatusAdditionalQuestion({
                                                                    userID: userID,
                                                                    jobID: jobID,
                                                                    questionID: x.id,
                                                                    status: true
                                                                })
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
                                                                            // setOpen(false)
                                                                            return message; // Display the success message
                                                                        },
                                                                        error: (error) => error.message || "Something went wrong", // Show the error message
                                                                    }
                                                                );
                                                            } catch (error) {
                                                                console.error("Form submission error", error);
                                                                toast.error("Failed to submit the form. Please try again.");
                                                            }
                                                        }}>Delete Item</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        <div className="flex gap-x-3 mt-2">
                                            <Badge variant={'outline'} className="font-light">
                                                {x.dataType}
                                            </Badge>
                                            <Badge variant={'outline'} className="font-light">
                                                {x.rule}
                                            </Badge>
                                        </div>
                                        <div className="pl-5">
                                            {x.dataType.includes('Multiple Choice Question') &&
                                                <ul className="list-disc text-xs space-y-0.5 mt-2">
                                                    {x.option.map((x, index) => (
                                                        <li key={index} className="">{x}</li>
                                                    ))}
                                                </ul>
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    }
                    <div className="pb-5 mt-4">
                    </div>
                </div>
                <Button type="submit">Submit</Button>
            </form>
        </Form>
    )
}