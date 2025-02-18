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
import { Check, Pen } from "lucide-react"
import { updateOrganizationName } from "@/actions/organization"

const formSchema = z.object({
    organizationName: z.string({ required_error: "Organization Name is required!!" })
});

export default function OrganizationName({ organizationName, userID, organizationID }: { organizationName: string, userID: string, organizationID: string }) {
    const [isEditable, setIsEditable] = useState<boolean>(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            organizationName: organizationName
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const promise = updateOrganizationName({ organizationId: organizationID, organizationName: values.organizationName })
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
            setIsEditable(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
                <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                        <FormItem className="space-y-1">
                            <FormLabel className="text-xs text-muted-foreground">Organization Name</FormLabel>
                            <FormControl className="relative">
                                <div className="relative">
                                    <Input
                                        placeholder=""
                                        type=""
                                        disabled={!isEditable}
                                        {...field} />
                                    {isEditable ?
                                        <Button
                                            type="submit"
                                            className="absolute top-0 right-1" variant={'link'}>
                                            <Check className="size-4" />
                                        </Button> :
                                        <Button
                                            onClick={(e) => {
                                                setIsEditable(true)
                                                e.preventDefault();
                                            }}
                                            type="button"
                                            className="absolute top-0 right-1" variant={'link'}>
                                            <Pen className="size-4" />
                                        </Button>
                                    }
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                    )}
                />
            </form>
        </Form>
    )
}