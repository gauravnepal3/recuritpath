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
    Textarea
} from "@repo/ui/components/textarea"
import { File, Paperclip, Send } from "lucide-react"
import { sendEmail } from "@/lib/mail"
import { sendMessage } from "@/actions/messages"

const formSchema = z.object({
    message: z.string().optional()
});



export default function EmailMessage({ userID, candidateID }: {
    userID: string, candidateID: string
}) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),

    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const promise = sendMessage({
                userID: userID, candidateID: candidateID,
                body: values.message ?? '',
                from: 'career@requro.com',
                mailTo: 'gauravnepal3@gmail.com',
                subject: "Test Mail"
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
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="border-t relative">

                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea
                                    placeholder="Type your message"
                                    className="resize-none border-none !h-full shadow-none rounded-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="absolute flex items-center gap-x-2 top-2 right-2">
                    <Button variant={'link'}><Paperclip /></Button>
                    <Button className="p-2" type="submit"><Send className="size-4" /></Button>
                </div>
            </form>
        </Form>
    )
}