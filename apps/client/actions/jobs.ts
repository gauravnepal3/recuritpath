"use server";
import { MailingTemplate } from '@/constant/mailing-template'

import { generatePresignedUrl } from "./getPresignedURL";
import { validateRecaptcha } from "./reCaptcha";

import { prisma } from "@repo/database"
import { sendEmail } from '@/lib/mail';
import path from 'path';

interface SuccessResponse<T = any> {
    type: "SUCCESS";
    message: string;
    data: T;
}

interface ErrorResponse {
    type: "ERROR";
    message: string;
}

interface CandidateApplication {
    id: string;
    jobId: string;
    stageId: string
    createdAt: Date;
    formResponses: {
        id: string;
        candidateApplicationId: string;
        jobApplicationId: string;
        label: string;
        value: string | null;
        createdAt: Date;
    }[];
}

export const submitForm = async (formData: FormData): Promise<SuccessResponse<CandidateApplication> | ErrorResponse> => {
    try {
        const token = formData.get("recaptchaToken");
        const jobID = formData.get("jobID");

        if (!token || !jobID) {
            return { type: "ERROR", message: "Missing required fields" };
        }

        // Step 1: Validate reCAPTCHA
        const recaptchaResult = await validateRecaptcha(token as string);
        if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
            return { type: "ERROR", message: "reCAPTCHA validation failed" };
        }

        // Step 2: Fetch form metadata
        const formMetaData = await prisma.jobApplication.findMany({
            where: { jobId: jobID as string, isDeleted: false },
        });

        const jobData = await prisma.jobPost.findFirst({
            where: {
                id: jobID as string
            },
            include: {
                jobStage: true,
                organization: true
            }
        })

        if (!jobData) {
            throw new Error("Invalid Request!")
        }

        if (!formMetaData || formMetaData.length === 0) {
            return { type: "ERROR", message: "No form metadata found" };
        }

        // Step 3: Process form data
        const formValues = Object.fromEntries(formData.entries());

        const mappedData = await Promise.all(
            formMetaData.map(async (field: any) => {
                const value = formValues[field.id] ?? null; // Ensure we never get `undefined`

                // Validation
                let isValid = validateField(value as string | File, field.rule, field.dataType);
                if (!isValid) return null; // Skip invalid fields

                // Handle file uploads
                if (field.dataType === "File" && value instanceof File) {
                    const file = value as File;
                    const timestamp = new Date().toISOString().replace(/[:.-]/g, "");
                    const newFileName = `${timestamp}-${file.name}`;

                    const presignedUrl = await generatePresignedUrl(newFileName, file.type);
                    const uploadResponse = await fetch(presignedUrl, {
                        method: "PUT",
                        body: file,
                        headers: { "Content-Type": file.type },
                    });

                    if (!uploadResponse.ok) {
                        throw new Error(`File upload failed: ${uploadResponse.statusText}`);
                    }

                    return { label: field.label, value: newFileName, jobApplicationId: field.id };
                }

                return { label: field.label, value: value as string, jobApplicationId: field.id };
            })
        );

        // Filter out null values to prevent Prisma errors
        const validMappedData = mappedData.filter((field) => field !== null);

        if (validMappedData.length === 0) {
            return { type: "ERROR", message: "No valid form responses" };
        }

        const inboxStage = jobData.jobStage.find(x => x.name === "Inbox");
        if (!inboxStage) {
            return { type: "ERROR", message: "Inbox stage not found" };
        }
        let mailTemplate;
        mailTemplate = await prisma.jobMailingTemplate.findFirst({
            where: {
                jobId: jobData.id,
                name: "Application Received"
            }
        })

        if (!mailTemplate) {
            mailTemplate = MailingTemplate.find(x => x.name === "Application Received")
        }
        // Step 4: Save candidate application
        const candidateApplication = await prisma.candidateApplication.create({
            data: {
                jobId: jobID as string,
                stageId: inboxStage.id,
                formResponses: {
                    create: validMappedData.map((field) => ({
                        label: field!.label,  // `!` because we already filtered out nulls
                        value: field!.value,
                        jobApplicationId: field!.jobApplicationId,
                    })),
                },
                CandidateTimeline: {
                    create: {
                        actionType: "APPLIED",
                        timelineText: `${validMappedData.find(x => x.label === "Name")?.value} applied for the position ${jobData.title}`,
                        jobId: jobData.id,
                    }
                }
            },
            include: { formResponses: true, CandidateTimeline: true },
        });

        const replacements = {
            "Candidate Name": candidateApplication.formResponses.find(x => x.label === "Name")?.value,
            "Job Title": jobData.title,
            "Organization Name": jobData.organization.name,
            "Company Name": jobData.organization.name,  // If you need it as a separate placeholder
        };
        if (mailTemplate) {
            const parsedBody = replacePlaceholdersInBody(mailTemplate.body, replacements);
            const mail = await sendEmail(
                {
                    to: [validMappedData.find(x => x.label === "Email")?.value ?? ''],
                    from: 'career@requro.com',
                    subject: mailTemplate?.subject ?? 'Application Received',
                    body: mailTemplate?.body ?? '',
                    htmlTemplate: {
                        filePath: path.join(process.cwd(), "mailTemplates", "thankyou.hbs"),
                        context: {
                            companyLogo: `${process.env.S3_PUBLIC_URL}/${jobData.organization.logo}`,
                            candidateName: candidateApplication.formResponses.find(x => x.label === "Name")?.value,
                            jobTitle: jobData.title,
                            message: parsedBody,
                            companyName: jobData.organization.name,
                            candidateId: candidateApplication.id,
                        }
                    }
                }
            )
        }
        return { type: "SUCCESS", message: "Form submitted successfully", data: candidateApplication };
    } catch (err) {
        console.error("Form submission error:", err);
        return { type: "ERROR", message: "Something went wrong!" };
    }
};

// Helper function to validate fields
function validateField(value: string | File, rule: string, dataType: string): boolean {
    if (rule === "Required") {
        if (dataType === "File") return value instanceof File;
        return !!value;
    }
    return true;
}


const replacePlaceholdersInBody = (bodyTemplate: string, replacements: Record<string, string | null | undefined>) => {
    return bodyTemplate.replace(/{{(.*?)}}/g, (_, key) => {
        // Trim any extra spaces and get the replacement value from the replacements object
        const value = replacements[key.trim()];
        return value || `{{${key}}}`; // If value is undefined or null, leave the placeholder
    });
};
