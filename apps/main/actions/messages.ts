'use server'
import { currentUser } from "@/lib/auth";
import { candidateAccessScope } from '@/lib/organization'
import { sendEmail } from "@/lib/mail";
import { prisma } from "@repo/database"
import { revalidatePath } from "next/cache";
import { NEXT_URL } from "next/dist/client/components/app-router-headers";
import { redirect } from "next/navigation";
import path from "path";


interface SuccessResponse<T = any> {
    type: "SUCCESS";
    message: string;
    data: T;
}

interface ErrorResponse {
    type: "ERROR";
    message: string;
    data?: never; // Optional and explicitly not allowed for "ERROR"
}


export const sendMessage = async ({
    userID,
    candidateID,
    body,
    subject,
    attachment
}: {
    userID: string,
    candidateID: string,
    body: string,
    subject: string,
    attachment?: File
}) => {
    try {
        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }
        const candidateDetails = await prisma.candidateApplication.findFirst({
            where: {
                id: candidateID,
                ...candidateAccessScope(user.id),
            },
            include: {
                jobPost: {
                    select: {
                        title: true,
                        organization: {
                            select: {
                                name: true,
                                logo: true
                            }
                        }
                    }
                },
                formResponses: true
            }
        })
        if (!candidateDetails) {
            return {
                type: "ERROR",
                message: "Unable to handle the request!"
            }
        }
        // The recipient is the candidate's own address from their application,
        // not whatever the caller passed. This previously sent every candidate
        // message to one hardcoded gmail address.
        const candidateEmail = candidateDetails.formResponses.find(
            (x) => x.label?.toLowerCase() === "email"
        )?.value;
        if (!candidateEmail) {
            return {
                type: "ERROR",
                message: "This candidate has no email address on file."
            }
        }

        const mail = await sendEmail({
            to: [candidateEmail],
            body: body,
            subject: subject || "You have a new message.",
            htmlTemplate: {
                filePath: path.join(process.cwd(), "mailTemplates", "newMessage.hbs"),
                context: {
                    companyLogo: `${process.env.S3_PUBLIC_URL}/${candidateDetails.jobPost.organization.logo}`,
                    candidateName: candidateDetails.formResponses.find(x => x.label === "Name")?.value,
                    jobTitle: candidateDetails.jobPost.title,
                    messageSnippet: body,
                    messageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/jobs/${candidateDetails.jobId}/stage/${candidateDetails.stageId}/applicants/${candidateDetails.id}/message`,
                    companyName: candidateDetails.jobPost.organization.name,
                    candidateId: candidateDetails.id,
                    userId: userID
                }
            }
        })
        const emailData = await prisma.emailMessage.create({
            data: {
                body: body,
                direction: "SENT",
                messageId: mail?.MessageId ?? '',
                recipient: candidateEmail,
                sender: process.env.MAIL_FROM_ADDRESS ?? "",
                subject: subject,
                candidateId: candidateID,
                userId: userID,
            }
        })

        revalidatePath(`/jobs/${candidateDetails.jobId}/stage/${candidateDetails.stageId}/applicants/${candidateDetails.id}/message`)
        return {
            type: "SUCCESS",
            message: "Success",
            data: emailData
        }
    } catch (err) {
        return {
            type: "ERROR",
            message: "Something went wrong!"
        }
    }
}


