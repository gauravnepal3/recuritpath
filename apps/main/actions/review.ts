"use server"
import { z } from "zod"
import { currentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from "@repo/database"
import { revalidatePath } from "next/cache"
const reviewSchema = z.object({
    position: z
        .string({
            required_error: "Please select you position on candidate.",
        }),
})

interface SuccessResponse<T = any> {
    type: "SUCCESS";
    message: string;
    data: any; // Required when type is "SUCCESS"
}

interface ErrorResponse {
    type: "ERROR";
    message: string;
    data?: never; // Optional and explicitly not allowed for "ERROR"
}

export const addReview = async ({ userID, jobID, candidateID, verdict, review }: { userID: string, jobID: string, candidateID: string, verdict: string, review: string }) => {
    try {
        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }
        if (user?.id !== userID) {
            throw new Error("Invalid user request")
        }
        const candidateDetails = await prisma.candidateApplication.findFirst({
            where: {
                id: candidateID
            }
        })
        if (!candidateDetails) {
            return {
                type: "ERROR",
                message: "Invalid update request made!"
            }
        }
        try {

            const addRecord = await prisma.candidateReview.create({
                data: {
                    verdict: verdict,
                    description: review,
                    candidateTimeline: {
                        create: {
                            actionType: "REVIEW",
                            timelineText: `${user?.name} left a review`,
                            candidateId: candidateID,
                            jobId: jobID,
                            userId: userID,
                        }
                    }
                },
                include: { candidateTimeline: true }
            })
            revalidatePath(`/jobs/${jobID}/stages/${candidateDetails.stageId}/applicants/${candidateID}`)
            return {
                type: "SUCCESS",
                message: "Success"
            }
        } catch (err) {
            console.log(err)
            return {
                type: "ERROR",
                message: "Something went wrong!"
            }
        }
    } catch (err) {
        console.log(err)
        return {
            type: "ERROR",
            message: "Something went wrong!"
        }
    }
}
