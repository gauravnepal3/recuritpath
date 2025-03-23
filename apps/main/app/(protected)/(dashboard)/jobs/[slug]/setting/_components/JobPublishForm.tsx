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
    Button
} from "@repo/ui/components/button"
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover"

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
    RadioGroup,
    RadioGroupItem
} from "@repo/ui/components/radio-group"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@repo/ui/components/calendar"
import { publishJobPost } from "@/actions/jobs"

const formSchema = z
    .object({
        management: z.string({ required_error: "Please select an option." }),
        date_range: z
            .object({
                from: z.date().optional(),
                to: z.date().optional(),
            })
            .optional(),
    })
    .superRefine((data, ctx) => {
        if (data.management === "automatic") {
            if (!data.date_range?.from || !data.date_range?.to) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Please select a range.",
                    path: ["date_range"],
                });
            }
        }
    });



export default function JobPublishForm({ setOpen, jobDetails, userID, jobID, organizationID }: { setOpen: Function, jobDetails: any, userID: string, jobID: string, organizationID: string }) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            management: (jobDetails?.isPublished === true && jobDetails?.dateStart === null) ? 'manual' : 'automatic',
            date_range: {
                from: jobDetails.dateStart,
                to: jobDetails.dateEnd
            }
        }

    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const promise = publishJobPost({ userID: userID, jobID: jobID, data: values, organizationID: organizationID })
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
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">

                <FormField
                    control={form.control}
                    name="management"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormControl>
                                <RadioGroup
                                    defaultValue={field.value}
                                    onValueChange={field.onChange}
                                    className="flex flex-col space-y-1"
                                >
                                    {[
                                        ["Job will be posted until you archive it.", "manual"],
                                        ["Post job for certain date range.", "automatic"],
                                    ].map((option, index) => (
                                        <FormItem className="flex items-center space-x-3 space-y-0" key={index}>
                                            <FormControl>
                                                <RadioGroupItem value={option[1] as string} />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {option[0]}
                                            </FormLabel>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {form.watch('management') === "automatic" &&
                    <FormField
                        control={form.control}
                        name="date_range"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                    <Popover modal={true}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !field.value && "text-muted-foreground",
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value?.from ? (
                                                    field.value.to ? (
                                                        <>
                                                            {format(field.value.from, "LLL dd, y")} -{" "}
                                                            {format(field.value.to, "LLL dd, y")}
                                                        </>
                                                    ) : (
                                                        format(field.value.from, "LLL dd, y")
                                                    )
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="pointer-events-auto w-auto p-0" align="start">
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                defaultMonth={field.value?.from}
                                                // @ts-ignore
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                numberOfMonths={2}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormControl>
                                <FormDescription>
                                    Select the date for when the event will take place
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                }
                <div className="flex justify-end pt-3">
                    <Button className="ml-auto" type="submit">Publish</Button>
                </div>
            </form>
        </Form>
    )
}