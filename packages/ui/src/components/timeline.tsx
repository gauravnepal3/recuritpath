import * as React from "react"
import { cn } from "@repo/ui/lib/utils"

const Timeline = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("relative", className)} {...props}>
            <div className="absolute left-5 top-5 bottom-5 w-[3px] bg-border" />
            {props.children}
        </div>
    ),
)
Timeline.displayName = "Timeline"

const TimelineIcon = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        variant?: "default" | "avatar"
    }
>(({ className, variant = "default", ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "absolute z-20 bg-background w-8 h-8 flex items-center justify-center rounded border",
            variant === "avatar" && "overflow-hidden",
            className,
        )}
        {...props}
    />
))
TimelineIcon.displayName = "TimelineIcon"

const TimelineItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => <div ref={ref} className={cn("relative mb-8 last:mb-0", className)} {...props} />,
)
TimelineItem.displayName = "TimelineItem"

const TimelineContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        position?: "bottom" | "top"
    }
>(({ className, position = "bottom", ...props }, ref) => (
    <div
        ref={ref}
        className={cn("ml-7", position === "bottom" ? "pt-2" : "-translate-y-full", className)}
        {...props}
    />
))
TimelineContent.displayName = "TimelineContent"

export { Timeline, TimelineIcon, TimelineItem, TimelineContent }

