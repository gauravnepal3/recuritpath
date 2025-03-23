'use client'
import { Copy } from "lucide-react"
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
import { Input } from "@repo/ui/components/input"
import { Label } from "@repo/ui/components/label"
import { AddOrganizationForm } from "./AddOrganizationForm"

export function AddOrganizationDialog({ userID }: { userID: string }) {
    const [open, setOpen] = React.useState<boolean>(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="font-light">Add</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create new organization</DialogTitle>
                </DialogHeader>
                <AddOrganizationForm userID={userID} setOpen={setOpen} />
            </DialogContent>
        </Dialog>
    )
}
