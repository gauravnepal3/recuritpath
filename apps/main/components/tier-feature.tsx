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

export function TierFeature({ children }: { children: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Premium Feature</DialogTitle>
                </DialogHeader>
                <div className="items-center space-x-2">
                    <div className="">
                        You just discovered a premium feature. To unlock this feature, please upgrade your plan.
                    </div>

                </div>
                <DialogFooter className="sm:justify-start">
                    <div className="w-full">
                        <Button variant="default" className="w-full">
                            Upgrade Plan
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
