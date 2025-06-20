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
import { Input } from "@repo/ui/components/input"
import { Label } from "@repo/ui/components/label"
import { Textarea } from "@repo/ui/components/textarea"
import { toast } from "sonner"
import React from "react"
import { addComment, addJobMailingTemplate, updateJobMailingTemplate } from "@/actions/jobs"

type TemplateType = {
    isCustom: boolean;
    isDefaultEdited: boolean;
    id: string;
    name: string;
    subject: string;
    body: string;
    createdAt: Date;
    jobId: string;
} | {
    isCustom: boolean;
    isDefaultEdited: boolean;
    name: string;
    subject: string;
    body: string;
}
const FormSchema = z.object({
    subject: z.string(),
    name: z.string(),
    body: z
        .string()
        .min(10, {
            message: "Comment must be at least 10 characters.",
        })
        .max(500, {
            message: "Comment must not be longer than 500 characters.",
        }),
})

export function EditTemplateDialog({ userID, jobID, template }: { userID: string, template: TemplateType, jobID: string }) {
    const dynamicValue = ['CandidateName', 'CompanyName', 'JobTitle', 'JobCategory']
    const [updatedBody, setUpdatedBody] = React.useState("");
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: template.name,
            body: template.body ?? '',
            subject: template.subject
        }
    })
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    React.useEffect(() => {
        if (updatedBody) {
            form.setValue("body", updatedBody);
        }
    }, [updatedBody, form]);

    const [open, setOpen] = React.useState<boolean>(false);
    function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            const promise = (template.isDefaultEdited || template.isCustom) ?
                updateJobMailingTemplate(
                    {
                        userID: userID, templateName: data.name, templateSubject: data.subject, templateBody: data.body, jobID: jobID, templateId: 'id' in template ? template.id : ''
                    }
                )
                : addJobMailingTemplate({ userID: userID, templateName: data.name, templateSubject: data.subject, templateBody: data.body, jobID: jobID })
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
                <Button variant={'link'} className='text-xs font-normal'>
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Template</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            disabled={!template.isCustom}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="shadcn" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subject"
                            disabled={!template.isCustom}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input placeholder="shadcn" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is subject send in mail.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="body"
                            render={({ field }) => {
                                return (
                                    <FormItem className="space-y-1 mt-3">
                                        <FormLabel>Body</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-col space-y-2">
                                                <Textarea
                                                    placeholder="Share a little bit about the candidate. You can use dynamic values like {{JobName}}."
                                                    className="resize-none min-h-[250px]"
                                                    {...field} // Keep this to bind React Hook Form
                                                    ref={(el) => {
                                                        field.ref(el); // Assign to RHF
                                                        textareaRef.current = el; // Assign to custom ref
                                                    }}
                                                />
                                                <div className="flex space-x-2">
                                                    {dynamicValue.map(x => (
                                                        <Button
                                                            key={x}
                                                            type="button"
                                                            variant="outline"
                                                            className="text-sm font-light"
                                                            onClick={() => {
                                                                const start = textareaRef.current?.selectionStart || 0;
                                                                const end = textareaRef.current?.selectionEnd || 0;
                                                                const value = field.value;
                                                                const newValue = `${value.slice(0, start)}{{${x}}}${value.slice(end)}`;
                                                                setUpdatedBody(newValue); // Defer setting form value
                                                            }}
                                                        >
                                                            {`{{${x}}}`}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
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
