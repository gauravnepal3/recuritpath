'use client'
import React from "react"
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
import { AddJobForm } from "./AddJobForm"


export function AddJobDialog({ userID, organizationID }: { userID: string, organizationID: string }) {
    const [open, setOpen] = React.useState<boolean>(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="font-light">Add</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create new Job post</DialogTitle>
                </DialogHeader>
                <AddJobForm userID={userID} setOpen={setOpen} organizationID={organizationID} />
            </DialogContent>
        </Dialog>
    )
}
