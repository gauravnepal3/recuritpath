"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { createJobPost } from "@/actions/jobs"
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
import { useRouter } from "next/navigation"
const FormSchema = z.object({
    title: z.string().min(1, {
        message: "Name is required",
    }),
})

export function AddJobForm({ userID, organizationID, setOpen }: { userID: string, organizationID: string, setOpen: Function }) {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: "",
        },
    })
    const router = useRouter()
    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const promise = createJobPost(userID, data.title, organizationID);

        toast.promise(
            promise.then((response) => {
                // Check the custom response type
                if (response.type === "ERROR") {
                    throw new Error(response.message); // Throw error to trigger the `error` toast
                }
                return response; // Success case, pass the message for the `success` toast
            }),
            {
                loading: "Loading...",
                success: (message) => {
                    setOpen(false); // Close the modal or handle success logic
                    router.push(`/jobs/${message.data.id}/setting`)
                    return message.message; // Display the success message
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
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs text-muted-foreground">Job Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Assistant to the Regional Manager" {...field} />
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
