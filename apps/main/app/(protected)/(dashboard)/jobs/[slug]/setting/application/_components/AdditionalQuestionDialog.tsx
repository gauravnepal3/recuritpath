"use client"
import { Plus, Trash } from "lucide-react"
import { Button } from "@repo/ui/components/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@repo/ui/components/dialog"
import { Input } from "@repo/ui/components/input"
import { useState } from "react"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Form,
    FormControl,
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
import { addAdditionalQuestions } from "@/actions/jobs"
import JobApplication from "../page"

const formSchema = z
    .object({
        label: z.string({ required_error: "Label is required" }).min(1, { message: "Label is required" }),
        dataType: z.string({ required_error: "Select a type" }).min(1, { message: "Select a type" }),
        rule: z.string({ required_error: "Select a rule" }),
        options: z.array(z.string()).optional(), // Initial optional definition
    })
    .superRefine((data, ctx) => {
        // Validate `options` only if `dataType` is multiple choice
        if (
            data.dataType === "Multiple Choice Question (Single Select)" ||
            data.dataType === "Multiple Choice Question (Multiple Select)"
        ) {
            if (!data.options || data.options.length === 0) {
                ctx.addIssue({
                    path: ["options"],
                    message: "At least one option must be added.",
                    code: z.ZodIssueCode.custom,
                });
                ctx.addIssue({
                    path: ["options"],
                    message: "All option fields must be filled.",
                    code: z.ZodIssueCode.custom,
                });
            }
        }
    });


const dataTypeOptions = [
    "Short Answer",
    "Long Answer",
    "Link",
    "Multiple Choice Question (Single Select)",
    "Multiple Choice Question (Multiple Select)",
    "File",
]

const fieldStatus = ["Required", "Optional", "Hidden"]

export function AdditionalQuestionDialog({ userID, jobID }: { userID: string, jobID: string }) {
    const [open, setOpen] = useState<boolean>(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            label: "",
            dataType: "",
            rule: "Optional",
            options: [],
        },
    })

    const [options, setOptions] = useState<string[]>([]) // State for options

    function addOption() {
        setOptions([...options, ""]) // Add an empty option
    }

    function updateOption(index: number, value: string) {
        const updatedOptions = [...options]
        updatedOptions[index] = value
        setOptions(updatedOptions)
        form.setValue("options", updatedOptions) // Update form value
    }

    function removeOption(index: number) {
        const updatedOptions = options.filter((_, i) => i !== index)
        setOptions(updatedOptions)
        form.setValue("options", updatedOptions) // Update form value
    }

    function onSubmit(values: z.infer<typeof formSchema>) {
        // Check for empty options before final submission
        if (values.dataType.includes("Multiple Choice Question")) {
            if (!options.every((option) => option.trim() !== "")) {
                form.setError("options", {
                    type: "manual",
                    message: "All option fields must be filled.",
                })
                return
            }
        }

        try {
            const promise = addAdditionalQuestions({
                userID: userID,
                jobID: jobID,
                jobApplication: {
                    ...values,
                    questionType: 'Additional',
                    option: values.options || [],
                },
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="font-light" variant="secondary">Add Additional Questions</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Additional Questions</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit(onSubmit)(e)
                        }}
                        className="space-y-4"
                    >
                        {/* Question Label */}
                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel>Question</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter the question" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Field Type */}
                        <FormField
                            control={form.control}
                            name="dataType"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel>Field Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select field type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {dataTypeOptions.map((type, index) => (
                                                <SelectItem key={index} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Options for Multiple Choice */}
                        {form.watch("dataType").includes("Multiple Choice Question") && (
                            <FormItem className="space-y-2">
                                <FormLabel>Options</FormLabel>
                                <div className="space-y-2">
                                    {options.map((option, index) => (
                                        <div key={index} className="flex relative items-center gap-2">
                                            <Input
                                                value={option}
                                                onChange={(e) => updateOption(index, e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-0.5 w-8 h-8 right-0"
                                                onClick={() => removeOption(index)}
                                            >
                                                <Trash className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={addOption}
                                        className="w-full font-light"
                                    >
                                        <Plus className="mr-2 w-4 h-4" />
                                        Add Option
                                    </Button>
                                    {/* Display error if any */}
                                    {form.formState.errors.options && (
                                        <p className="text-sm text-red-500">
                                            {form.formState.errors.options.message}
                                        </p>
                                    )}
                                </div>
                            </FormItem>
                        )}

                        {/* Rule */}
                        <FormField
                            control={form.control}
                            name="rule"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel>Rule</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select rule" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {fieldStatus.map((status, index) => (
                                                <SelectItem key={index} value={status}>
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <Button type="submit">Save</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
