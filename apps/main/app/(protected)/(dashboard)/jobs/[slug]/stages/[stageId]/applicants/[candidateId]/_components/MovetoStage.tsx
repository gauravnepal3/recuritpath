'use client'
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
import {
    useForm
} from "react-hook-form"
import {
    zodResolver
} from "@hookform/resolvers/zod"
import * as z from "zod"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@repo/ui/components/select"
import { DropdownMenuItem } from "@repo/ui/components/dropdown-menu"
import { toast } from "sonner"
import { moveToStage } from "@/actions/jobs"
import { useRouter } from "next/navigation"
import { useState } from "react"

const formSchema = z.object({
    stage: z.string()
});
export function MoveToStage({ jobStages, userID, candidateID, jobID }: { jobStages: { label: string, value: string }[], userID: string, candidateID: string, jobID: string }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),

    })
    const [open, setOpen] = useState<boolean>(false)
    const router = useRouter()
    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            try {
                const promise = moveToStage({ userID: userID, candidateID: candidateID, stageID: values.stage })
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
                            router.push(`/jobs/${jobID}/stages/${values.stage}/applicants/${candidateID}`)
                            setOpen(false)
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
        } catch (error) {
            console.error("Form submission error", error);
            toast.error("Failed to submit the form. Please try again.");
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Move to Stage</DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Move to stage</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="stage"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-xs text-muted-foreground">Stage</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a stage" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {jobStages.filter(x => x.label !== "Archived").map(x => (
                                                <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>You can manage stages in job settings.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
