'use client'
import { Copy } from "lucide-react"

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
import JobPublishForm from "./JobPublishForm"
import React from "react"

export function JobPublishDialog(
    { userID, jobID, organizationID, jobDetails }: { jobDetails: any, userID: string, jobID: string, organizationID: string }
) {
    const [open, setOpen] = React.useState<boolean>(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="font-light" variant="default">{!jobDetails?.isPublished ? `Publish Job` : `Update Publish`}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Publish Job</DialogTitle>
                    <DialogDescription>
                        Your job is about to go live.
                    </DialogDescription>
                </DialogHeader>
                <JobPublishForm setOpen={setOpen} jobDetails={jobDetails} userID={userID} organizationID={organizationID} jobID={jobID} />
            </DialogContent>
        </Dialog>
    )
}
