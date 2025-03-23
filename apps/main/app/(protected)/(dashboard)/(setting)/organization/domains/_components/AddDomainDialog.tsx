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
import AddDomainForm from "./AddDomainForm"
import React from "react"

export function AddDomain({
    organizationId,
}: {
    organizationId: string
}) {
    const [open, setOpen] = React.useState<boolean>(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="mx-auto flex justify-center" asChild>
                <Button className="mx-auto" variant="default">Add Domain</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add a domain</DialogTitle>
                    <DialogDescription>
                        Allow candidate to view the page in your domain
                    </DialogDescription>
                </DialogHeader>

                <AddDomainForm organizationId={organizationId} setOpen={setOpen} />
            </DialogContent>
        </Dialog>
    )
}
