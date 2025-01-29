import { Skeleton } from "@repo/ui/components/skeleton";

export default function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    return (
        <div className="flex p-4 flex-col space-y-3">
            <Skeleton className="h-[425px] w-full rounded-xl" />

        </div>
    )
}