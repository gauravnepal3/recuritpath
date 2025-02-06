"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@repo/ui/components/form";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/components/select"; // ShadcnUI Select component
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { submitForm } from "@/actions/jobs";
import FormSubmitted from "./FormSubmitted";

type FormDetailsType = {
    id: string;
    label: string;
    dataType: string;
    option: string[];
    rule: string;
    questionType: string;
    isDeleted: boolean;
    jobId: string;
    createdAt: Date;
};

export default function MyForm({ formDetails }: { formDetails: FormDetailsType[] }) {
    // Dynamically generate the Zod schema based on formDetails
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [loading, setLoading] = useState<boolean>(false);
    const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
    const formSchema = z.object(
        formDetails.reduce((schema, field) => {
            if (field.rule !== "Hidden") {
                let fieldSchema;
                switch (field.dataType) {
                    case "Email":
                        fieldSchema = z.string().email();
                        break;
                    case "Phone":
                        fieldSchema = z.string().min(10).max(15);
                        break;
                    case "File":
                        fieldSchema = z.instanceof(File);
                        break;
                    case "Multiple Choice Question (Single Select)":
                        fieldSchema = z.string(); // Ensure the selected value is a string
                        break;
                    default:
                        fieldSchema = z.string();
                }
                if (field.rule === "Required") {
                    if (field.dataType === "File") {
                        fieldSchema = (fieldSchema as z.ZodType<File>).refine((file): file is File => file instanceof File && file.size > 0, {
                            message: "This field is required",
                        });
                    } else {
                        if (fieldSchema instanceof z.ZodString) {
                            fieldSchema = fieldSchema.min(1, { message: "This field is required" });
                        }
                    }
                } else {
                    fieldSchema = fieldSchema.optional(); // Mark optional fields as optional
                }
                schema[field.id] = fieldSchema;
            }
            return schema;
        }, {} as Record<string, z.ZodTypeAny>)
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: formDetails.reduce((values, field) => {
            if (field.rule !== "Hidden") {
                // Set default values based on the field type
                switch (field.dataType) {
                    case "File":
                        values[field.id] = undefined; // Files are initially undefined
                        break;
                    case "Multiple Choice Question (Single Select)":
                        values[field.id] = ""; // Default to an empty string for select fields
                        break;
                    default:
                        values[field.id] = ""; // Default to an empty string for other fields
                }
            }
            return values;
        }, {} as Record<string, any>),
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // console.log("Hello")
        try {
            if (!executeRecaptcha) {
                toast.error("reCAPTCHA not loaded. Please try again.");
                return;
            }
            const token = await executeRecaptcha("form_submit");
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append("recaptchaToken", token);
            formData.append("jobID", formDetails[0]?.jobId as string);
            setLoading(true);
            try {
                const promise = submitForm(formData)
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
                            setFormSubmitted(true)
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
        } catch (error) {
            console.error("Form submission error", error);
            toast.error("Failed to submit the form. Please try again.");
        }
    }

    // Sort fields in the desired order
    const sortedFields = formDetails
        .filter((field) => field.rule !== "Hidden") // Exclude hidden fields
        .sort((a, b) => {
            // Define the order of fields
            const order = [
                "Name",
                "Email",
                "Location",
                "Phone Number",
                "Github",
                "LinkedIn",
                "Resume",
            ];
            const aIndex = order.indexOf(a.label);
            const bIndex = order.indexOf(b.label);

            // If both fields are in the order array, sort them based on the order
            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
            }
            // If only one field is in the order array, prioritize it
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            // If neither field is in the order array, sort additional fields at the end
            return 0;
        });

    return (
        <>
            {formSubmitted ?
                <FormSubmitted /> :
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Render fields in the sorted order */}
                        {sortedFields.map((field) => (
                            <FormField
                                key={field.id}
                                control={form.control}
                                name={field.id}
                                render={({ field: formField }) => (
                                    <FormItem>
                                        <FormLabel>
                                            <span>
                                                {field.label}
                                            </span>
                                            {field.rule === "Required" &&
                                                <span className=" ml-2 text-xs text-muted-foreground">
                                                    (Required)
                                                </span>
                                            }
                                        </FormLabel>
                                        <FormControl>
                                            {field.dataType === "File" ? (
                                                <Input
                                                    type="file"
                                                    onChange={(e) => formField.onChange(e.target.files?.[0])}
                                                />
                                            ) : field.dataType === "Long Text" ? (
                                                <Textarea placeholder={field.label} {...formField} />
                                            ) : field.dataType === "Multiple Choice Question (Single Select)" ? (
                                                <Select onValueChange={formField.onChange} value={formField.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={`Select a option`} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {field.option.map((option) => (
                                                            <SelectItem key={option} value={option}>
                                                                {option}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input
                                                    placeholder={field.label}
                                                    type={
                                                        field.dataType === "Email"
                                                            ? "email"
                                                            : field.dataType === "Phone"
                                                                ? "tel"
                                                                : "text"
                                                    }
                                                    {...formField}
                                                />
                                            )}
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}

                        <Button
                            disabled={loading}
                            type="submit">Submit</Button>
                    </form>
                </Form>
            }
        </>
    );
}