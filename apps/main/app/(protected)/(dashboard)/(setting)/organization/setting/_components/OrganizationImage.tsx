"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/form";
import { Cross, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { uploadOrganizationImage } from "@/actions/organization";

// ✅ Define Zod Schema
const fileSchema = z.object({
    file: z
        .instanceof(File, { message: "File is required" })
        .refine((file) => ["image/png", "image/jpeg"].includes(file.type), {
            message: "Only PNG or JPEG files are allowed",
        })
        .refine((file) => file.size <= 2 * 1024 * 1024, {
            message: "File size must be less than 2MB",
        }),
});

// ✅ Form Type
type FileFormValues = z.infer<typeof fileSchema>;

export default function OrganizationImage({ organizationID, image }: { organizationID: string, image: string | null }) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(image);

    const form = useForm<FileFormValues>({
        resolver: zodResolver(fileSchema),
        defaultValues: { file: undefined },
    });

    // Handle File Change
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fieldChange: (value: File) => void) => {
        const file = event.target.files?.[0];
        if (file) {
            fieldChange(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Handle Form Submission
    const onSubmit = async (values: FileFormValues) => {
        try {
            const promise = uploadOrganizationImage({ organizationId: organizationID, file: values.file })
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
        }
        // Upload logic goes here
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex gap-x-4 mt-2 items-center">
                {/* File Input */}
                <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-muted-foreground text-xs mb-2">Organization Logo</FormLabel>
                            <FormControl>
                                <div className="flex gap-2 ">
                                    {previewUrl ? (
                                        <div className="flex justify-center relative">
                                            <Button className="absolute top-0 -right-10" onClick={(e) => { e.preventDefault(); setPreviewUrl(null) }} type="button" variant={'link'}>
                                                <X />
                                            </Button>
                                            <img src={previewUrl} alt="Preview" className="h-24 w-24 object-cover rounded-md" />
                                        </div>
                                    ) :
                                        <label htmlFor="file-upload" className="cursor-pointer w-16 h-16 grid place-items-center border-dashed border border-primary rounded-full text-center">
                                            <UploadCloud width={20} height={20} className=" text-gray-500" />
                                        </label>
                                    }
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        accept="image/png, image/jpeg"
                                        className="hidden"
                                        onChange={(event) => handleFileChange(event, field.onChange)}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                {/* Submit Button */}
                {form.getValues('file') &&
                    <Button type="submit" className=" ml-4">
                        Upload
                    </Button>
                }
            </form>
        </Form>
    );
}
