'use client'
import * as React from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroupLabel,
    SidebarRail,
} from "@repo/ui/components/sidebar"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu"
import { NavSecondary } from "./nav-secondary"
import { File, Mail, MessageCircle, User, Clipboard, Phone, MoreHorizontal } from "lucide-react" // Adjust icon import as necessary
import { Button } from "@repo/ui/components/button"
import { moveToStage } from "@/actions/jobs"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { MoveToStage } from "./MovetoStage"
import { ArchiveCandidate } from "./ArchiveCandidate"

type applicantDataType = {
    id: string;
    createdAt: Date;
    formResponses: {
        id: string;
        candidateApplicationId: string;
        jobApplicationId: string;
        label: string;
        value: string | null;
        createdAt: Date;
    }[]
    jobPost: {
        jobStage: {
            id: string,
            name: string,
            jobId: string,
            displayOrder: number
        }[]
    }
}

export function AppSidebar({ applicantData, jobID, candidateID, stageID, userID }: { jobID: string, candidateID: string, stageID: string, applicantData: applicantDataType, userID: string }) {
    const router = useRouter();
    const navSecondaryItems = [
        {
            title: "Overview",
            icon: Clipboard,
            url: `/jobs/${jobID}/stages/${stageID}/applicants/${candidateID}`,
        },
        {
            title: "Resume",
            icon: File,
            url: `/jobs/${jobID}/stages/${stageID}/applicants/${candidateID}/resume`,
        },
        {
            title: "Message",
            icon: MessageCircle,
            url: `/jobs/${jobID}/stages/${stageID}/applicants/${candidateID}/message`,
        }
    ]
    const currentJobStage = applicantData.jobPost.jobStage.find(x => x.id === stageID)
    const nextJobStage = applicantData.jobPost.jobStage.find(x => x.displayOrder === Number((currentJobStage?.displayOrder ?? 0) + 1))
    return (
        <Sidebar
            collapsible="none"
            className="border-r  border-t-0 bg-background"
        >
            <SidebarContent>
                <SidebarGroupLabel className="pl-3 pt-7 text-xl font-bold text-primary">
                    {applicantData.formResponses.find(x => x.label === "Name")?.value}
                </SidebarGroupLabel>
                <div className="mt-4">
                    <NavSecondary items={navSecondaryItems} />
                </div>

                <div className="pl-3 pt-3 text-xs font-bold">Contact Information</div>
                <SidebarGroupLabel className="mt-3">
                    <div className="flex flex-col gap-y-2">

                    <div className="flex gap-1 items-center text-xs">
                        <Mail className="size-4"></Mail>
                        <span className="underline">
                            {applicantData.formResponses.find(x => x.label === "Email")?.value}
                        </span>
                    </div>
                        {applicantData.formResponses.find(x => x.label === "Phone Number")?.value &&
                            <div className="flex gap-1 items-center text-xs">
                                <Phone className="size-4"></Phone>
                                <span className="">
                                    {applicantData.formResponses.find(x => x.label === "Phone Number")?.value}
                                </span>
                            </div>
                        }
                    </div>

                </SidebarGroupLabel>
                <SidebarGroupLabel className=" mt-5 flex">
                    {!(currentJobStage?.name == "Hired" || currentJobStage?.name == "Archived") &&
                        <Button onClick={() => {
                            try {
                                const promise = moveToStage({ userID: userID, candidateID: candidateID, stageID: nextJobStage?.id ?? '' })
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
                                            router.push(`/jobs/${jobID}/stages/${nextJobStage?.id}/applicants/${candidateID}`)

                                            return message; // Display the success message
                                        },
                                        error: (error) => error.message || "Something went wrong", // Show the error message
                                    }
                                );
                            } catch (error) {
                                console.error("Form submission error", error);
                                toast.error("Failed to submit the form. Please try again.");
                            }
                        }} className="text-xs font-light">
                            Move to {nextJobStage?.name}
                        </Button>
                    }
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 ml-4 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <MoveToStage userID={userID} candidateID={candidateID} jobID={jobID} jobStages={applicantData.jobPost.jobStage.map(x => ({ label: x.name, value: x.id }))} />
                            <ArchiveCandidate userID={userID} candidateID={candidateID} jobID={jobID} jobStages={applicantData.jobPost.jobStage.map(x => ({ label: x.name, value: x.id }))} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarGroupLabel>
                {/* Pass navSecondaryItems to NavSecondary */}
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
