'use client'
import * as React from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroupLabel,
    SidebarRail,
} from "@repo/ui/components/sidebar"
import { NavSecondary } from "./nav-secondary"
import { User } from "lucide-react" // Adjust icon import as necessary

type applicantDataType = {
    name: string,
    candidateStage: {
        id: string;
        stageId: string;
        formResponses: {
            id: string;
            label: string;
            value: string | null;
        }[];
    }[];
}

export function AppSidebar({ applicantsData, jobID }: { applicantsData: applicantDataType, jobID: string }) {

    const navSecondary = (applicantsData: applicantDataType) => {
        return applicantsData.candidateStage
            .flatMap((stage) =>
                stage.formResponses
                    .filter((response) => response.label === "Name" && response.value) // Ensure valid names
                    .map((response) => ({
                        title: response.value as string, // Ensure value is string
                        url: `/jobs/${jobID}/stages/${applicantsData.candidateStage[0]?.stageId}/applicants/${stage.id}`,
                        icon: User,
                    }))
            );
    };


    // Generate navSecondary items
    const navSecondaryItems = navSecondary(applicantsData);

    return (
        <Sidebar
            collapsible="none"
            className="border-r  border-t-0 bg-background"
        >
            <SidebarContent>
                <SidebarGroupLabel className="pl-3 pt-3 text-sm font-bold text-primary">
                    {applicantsData.name}
                </SidebarGroupLabel>

                {/* Pass navSecondaryItems to NavSecondary */}
                <NavSecondary items={navSecondaryItems} />
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    )
}
