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
    Input
} from "@repo/ui/components/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@repo/ui/components/select"
import { addTeamMember } from "@/actions/organization"
import { OrganizationRole } from "@repo/database"

const formSchema = z.object({
    email: z.string({ required_error: "Email is required" }).email({ message: "Email format mismatch!" }),
    role: z.string({ required_error: "You must assign a role" })
});

export default function AddTeamMemberForm({ userId, organizationId, setOpen }: { userId: string, organizationId: string, setOpen: Function }) {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ""
        }

    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const promise = addTeamMember({
                organizationId: organizationId, // replace with actual organizationId
                userId: userId, // replace with actual userId
                email: values.email,
                role: values.role as OrganizationRole
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
            setOpen(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="space-y-1 w-full">
                            <FormLabel className="text-xs text-muted-foreground">Email</FormLabel>
                            <FormControl>
                                <Input
                                    className="w-full"
                                    placeholder="john@example.com"

                                    type=""
                                    {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-xs text-muted-foreground">Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                    <SelectItem value="INTERVIEWER">Interviewer</SelectItem>
                                    <SelectItem value="REVIEWER">Reviewer</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end mt-3 pt-3">
                    <Button type="submit">Submit</Button>
                </div>
            </form>
        </Form>
    )
}