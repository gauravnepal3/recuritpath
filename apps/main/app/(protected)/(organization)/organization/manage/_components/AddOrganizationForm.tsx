"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createOrganization } from "../action"
import { toast } from "sonner"
import { Button } from "@repo/ui/components/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@repo/ui/components/form"
import { Input } from "@repo/ui/components/input"

const FormSchema = z.object({
    organizationName: z.string().min(1, {
        message: "Name is required",
    }),
})

export function AddOrganizationForm({ userID, setOpen }: { userID: string, setOpen: Function }) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            organizationName: "",
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const promise = createOrganization(userID, data.organizationName);

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
                    setOpen(false); // Close the modal or handle success logic
                    return message; // Display the success message
                },
                error: (error) => error.message || "Something went wrong", // Show the error message
            }
        );
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-6">
                <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Organization&apos;s Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Acem Inc" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <Button type="submit">Submit</Button>
                </div>
            </form>
        </Form>
    )
}
