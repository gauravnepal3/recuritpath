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
import { Input } from "@repo/ui/components/input"
import { Label } from "@repo/ui/components/label"
import AddTeamMemberForm from "./AddTeamMemberForm"
import React from "react"

export function AddTeamMember({ userId, organizationId }: { userId: string, organizationId: string }) {
    const [open, setOpen] = React.useState<boolean>(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="font-light" variant="default">Add Member</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add a member</DialogTitle>
                    <DialogDescription>
                        Allow your teammates to manage your portal.
                    </DialogDescription>
                </DialogHeader>
                <AddTeamMemberForm setOpen={setOpen} userId={userId} organizationId={organizationId} />
            </DialogContent>
        </Dialog>
    )
}
