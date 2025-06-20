"use server"
import { JobApplication, JobPost, JobStage, prisma } from '@repo/database'
import { z } from "zod"
import { currentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { organizationRoleGuard, userDetails } from '@/lib/utils'
import { getOrganizationTier } from '@/lib/subscription'
import { sendEmail } from '@/lib/mail'
import path from 'path'
import { MailingTemplate } from '@/constants/mailing-template'


const FormSchema = z.object({
    title: z.string().min(1, {
        message: "Name is required",
    }),
})
const jobPublishSchema = z
    .object({
        management: z.string({ required_error: "Please select an option." }),
        date_range: z
            .object({
                from: z.date().optional(),
                to: z.date().optional(),
            })
            .optional(),
    })
    .superRefine((data, ctx) => {
        if (data.management === "automatic") {
            if (!data.date_range?.from || !data.date_range?.to) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Please select a range.",
                    path: ["date_range"],
                });
            }
        }
    });

const jobUpdateSchema = z.object({
    title: z.string({ required_error: "Title is required" }).min(1, { message: "Title is required" }),
    category: z.string().optional(),
    employmentType: z.string().optional(),
    country: z.tuple([z.string(), z.string().optional()]).optional(),
    city: z.string().optional(),
    remoteOption: z.string().optional(),
    countryResidence: z.string().optional(),
    countryListResidence: z.string().array().optional(),
    displaySalary: z.string().optional(),
    currency: z.string().optional(),
    salaryAmount: z.number({ message: "Amount must be a number" }).optional(),
    minimumAmount: z.number({ message: "Amount must be a number" }).optional(),
    maximumAmount: z.number({ message: "Amount must be a number" }).optional()
}).superRefine(
    (data, ctx) => {
        if (data.countryResidence === "Yes" && (data.countryListResidence?.length ?? 0) < 1) {
            ctx.addIssue(
                {
                    message: "Country is required",
                    code: z.ZodIssueCode.custom,
                    path: ['countryListResidence']
                }
            )
        }

        if (data.minimumAmount && data.minimumAmount < 0) {
            ctx.addIssue(
                {
                    message: "Minimum Amount cannot be less than 0",
                    code: z.ZodIssueCode.custom,
                    path: ['minimumAmount']
                }
            )
        }
        if (data.maximumAmount && data.maximumAmount < 0) {
            ctx.addIssue(
                {
                    message: "Maximum Amount cannot be less than 0",
                    code: z.ZodIssueCode.custom,
                    path: ['maximumAmount']
                }
            )
        }

        if (data.salaryAmount && data.salaryAmount < 0) {
            ctx.addIssue(
                {
                    message: "Amount cannot be less than 0",
                    code: z.ZodIssueCode.custom,
                    path: ['salaryAmount']
                }
            )
        }
        if ((data.displaySalary === "Fixed Amount" || data.displaySalary === "Range") && !data.currency) {
            ctx.addIssue(
                {
                    message: "Currency is required",
                    code: z.ZodIssueCode.custom,
                    path: ['currency']
                }
            )

            if (data.displaySalary === "Fixed Amount" && !data.salaryAmount) {
                ctx.addIssue(
                    {
                        message: "Amount is required",
                        code: z.ZodIssueCode.custom,
                        path: ['salaryAmount']
                    }
                )
            }

            if (data.displaySalary === "Range" && (!data.minimumAmount)) {
                ctx.addIssue(
                    {
                        message: "Minimum is required",
                        code: z.ZodIssueCode.custom,
                        path: ['minimumAmount']
                    }
                )
            }
            if (data.displaySalary === "Range" && (!data.maximumAmount)) {
                ctx.addIssue(
                    {
                        message: "Maximum is required",
                        code: z.ZodIssueCode.custom,
                        path: ['maximumAmount']
                    }
                )
            }
        }
    }
);


interface SuccessResponse<T = JobPost> {
    type: "SUCCESS";
    message: string;
    data: JobPost; // Required when type is "SUCCESS"
}

interface ErrorResponse {
    type: "ERROR";
    message: string;
    data?: never; // Optional and explicitly not allowed for "ERROR"
}

const defaultJobStages = [
    {
        name: "Inbox",
        isDeletable: false,
        dispalyOrder: 1
    },
    {
        name: "Shortlisted",
        isDeletable: true,
        dispalyOrder: 2
    },
    {
        name: "Interview",
        isDeletable: true,
        dispalyOrder: 3
    },
    {
        name: "Offer",
        isDeletable: true,
        dispalyOrder: 4

    },
    {
        name: "Hired",
        isDeletable: false,
        dispalyOrder: 5
    },
    {
        name: "Archived",
        isDeletable: false,
        dispalyOrder: 6
    }
] as const

const defaultJobApplication = [
    {
        label: "Name",
        dataType: "Short Text",
        rule: "Required"
    },
    {
        label: "Email",
        dataType: "Email",
        rule: "Required"
    },
    {
        label: "Location",
        dataType: "Short Text",
        rule: "Optional"
    },
    {
        label: "Phone Number",
        dataType: "Phone",
        rule: "Optional"
    },
    {
        label: "Github",
        dataType: "Link",
        rule: "Hidden"
    },
    {
        label: "LinkedIn",
        dataType: "Link",
        rule: "Optional"
    },
    {
        label: "Resume",
        dataType: "File",
        rule: "Required"
    },
]

export const generatePreviewID = async (organizationID: string, jobID: string) => {
    try {
        const user = await userDetails()
        const roleGuard = await organizationRoleGuard({ email: user.email, organizationId: organizationID, action: "GENERATE PREVIEW LINK" })
        if (!roleGuard) {
            return {
                type: "ERROR",
                message: "Unauthorized action!"
            }
        }
        const generatePreview = await prisma.jobPreview.create({
            data: {
                jobId: jobID,
                organizationId: organizationID,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
                isExpired: false
            }
        })
        return {
            type: "SUCCESS",
            message: "Success",
            data: generatePreview
        }
    } catch (err) {
        console.log(err)
        return {
            type: "ERROR",
            message: "Something went wrong!"
        }
    }
}

export const createJobPost = async <T>(userID: string, title: string, organizationID: string): Promise<SuccessResponse<T> | ErrorResponse> => {
    try {

        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }

        const getOrganizationDetails = await prisma.organization.findFirst({
            where: {
                id: organizationID
            }
        })
        if (!getOrganizationDetails) {
            return {
                type: "ERROR",
                message: "Unable to handle the request!"
            }
        }
        const roleGuard = await organizationRoleGuard({ email: user.email, organizationId: getOrganizationDetails.id, action: "CREATE JOB" })
        if (!roleGuard) {
            return {
                type: "ERROR",
                message: "You are restricted for this action!"
            }
        }

        const rawData = {
            title: title,
            organizationId: organizationID
        }

        const createNewJob = await prisma.jobPost.create({
            data: rawData
        })
        const jobStageData = defaultJobStages.map((stage) => ({
            name: stage!.name,
            jobId: createNewJob.id,
            isDeletable: stage!.isDeletable,
            displayOrder: stage!.dispalyOrder
        }))
        const jobApplicationForm = defaultJobApplication.map((field) => ({
            ...field,
            jobId: createNewJob.id
        }))
        await Promise.all(
            [
                prisma.jobStage.createMany({
                    data: jobStageData
                }),
                prisma.jobApplication.createMany({
                    data: jobApplicationForm
                }),
                prisma.organizationActivityLog.create({
                    data: {
                        organizationId: organizationID,
                        action: `${user.email} just created new job ${createNewJob.title}`
                    }
                })
            ]
        )
        return {
            type: "SUCCESS",
            message: "Success",
            data: createNewJob
        }
    } catch (err) {
        console.log(err)
        return {
            type: "ERROR",
            message: "Something went wrong!"
        }
    }

}

export const publishJobPost = async ({ userID, organizationID, jobID, data }: { userID: string, organizationID: string, jobID: string, data: unknown }) => {
    try {
        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }
        if (user?.id !== userID) {
            throw new Error("Invalid user request")
        }

        const getOrganizationDetails = await prisma.organization.findFirst({
            where: {
                id: organizationID
            },
            include: {
                jobPost: {
                    select: {
                        id: true,
                        isPublished: true,
                        isScheduled: true,
                    }
                }
            }
        })
        if (!getOrganizationDetails) {
            return {
                type: "ERROR",
                message: "Unable to handle the request!"
            }
        }
        const roleGuard = await organizationRoleGuard({
            email: user.email,
            organizationId: getOrganizationDetails.id,
            action: "PUBLISH JOB"
        })
        if (!roleGuard) {
            return {
                type: "ERROR",
                message: "You are restricted for this action!"
            }
        }
        const validatedData = jobPublishSchema.safeParse(data);
        if (!validatedData.success) {
            // If validation fails, throw an error with validation messages
            return {
                type: "ERROR",
                message: validatedData.error.errors.map((err) => err.message).join(", ")
            }

        }
        let updateData;
        const { management, date_range } = validatedData.data
        const organizationTier = await getOrganizationTier();
        if (organizationTier === "Free" && management === "automatic") {
            return {
                type: "ERROR",
                message: "This feature is only available on paid plans."
            }
        }
        if (organizationTier === "Free" && getOrganizationDetails.jobPost.filter(x => x.isPublished === true || x.isScheduled === true).length > 0) {
            return {
                type: "ERROR",
                message: "You can only publish one job at a time."
            }
        }
        if (organizationTier === "Pro" && getOrganizationDetails.jobPost.filter(x => x.isPublished === true || x.isScheduled === true).length > 2) {
            return {
                type: "ERROR",
                message: "You can only publish three job at a time."
            }
        }
        if (management === "manual") {
            updateData = {
                isPublished: true,
                dateStart: null,
                dateEnd: null
            }
        } else {
            updateData = {
                dateStart: date_range?.from ? new Date(date_range?.from) : null,
                dateEnd: date_range?.to ? new Date(date_range?.to) : null,
                isPublished: false,
                isScheduled: true

            }
            if (date_range?.from === new Date()) {
                updateData = {
                    ...updateData,
                    isPublished: true,
                }
            }
        }
        const jobPost = await prisma.jobPost.update({
            where: {
                id: jobID
            },
            data: updateData
        })
        revalidatePath(`/jobs/${jobID}/setting`)
        return {
            type: "SUCCESS",
            message: "Success",
            data: jobPost
        }
    } catch (err) {
        return {
            type: "ERROR",
            message: "Something went wrong!"
        }
    }
}

export const updateJobDetails = async ({ userID, organizationID, jobID, data }: { userID: string, organizationID: string, jobID: string, data: unknown }) => {
    try {
        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }
        if (user?.id !== userID) {
            throw new Error("Invalid user request")
        }

        const getOrganizationDetails = await prisma.organization.findFirst({
            where: {
                id: organizationID
            },
        })
        if (!getOrganizationDetails) {
            return {
                type: "ERROR",
                message: "Unable to handle the request!"
            }
        }
        const roleGuard = await organizationRoleGuard({
            email: user.email,
            organizationId: getOrganizationDetails.id,
            action: "UPDATE JOB"
        })
        if (!roleGuard) {
            return {
                type: "ERROR",
                message: "You are restricted for this action!"
            }
        }

        const validatedData = jobUpdateSchema.safeParse(data);
        if (!validatedData.success) {
            // If validation fails, throw an error with validation messages
            return {
                type: "ERROR",
                message: validatedData.error.errors.map((err) => err.message).join(", ")
            }

        }

        const {
            title,
            category,
            employmentType,
            country,
            city,
            remoteOption,
            countryResidence,
            countryListResidence,
            displaySalary, // Defaults
            currency,
            salaryAmount,
            minimumAmount,
            maximumAmount,
        } = validatedData.data;
        const jobData = await prisma.jobPost.findFirst({
            where: {
                id: jobID
            }
        })
        if (!jobData) {
            return {
                type: "ERROR",
                message: "Invalid update request made!"
            }
        }
        try {

            const updatedJob = await prisma.jobPost.update({
                where: { id: jobID },
                data: {
                    title,
                    category,
                    employmentType,
                    country: country?.join('/'),
                    city,
                    remoteOption,
                    countryResidence,
                    countryListResidence,
                    displaySalary,
                    currency,
                    salaryAmount,
                    minimumAmount,
                    maximumAmount,
                },
            });
            revalidatePath(`/jobs/${jobID}/setting`)
            return {
                type: "SUCCESS",
                message: "Job Updated!",
                data: updatedJob
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

export const updateJobDescription = async ({ userID, jobID, description, organizationID }: { userID: string, jobID: string, description: string, organizationID: string }) => {

    try {


        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }
        if (user?.id !== userID) {
            throw new Error("Invalid user request")
        }

        const getOrganizationDetails = await prisma.organization.findFirst({
            where: {
                id: organizationID
            },
        })
        if (!getOrganizationDetails) {
            return {
                type: "ERROR",
                message: "Unable to handle the request!"
            }
        }

        const roleGuard = await organizationRoleGuard({
            email: user.email,
            organizationId: getOrganizationDetails.id,
            action: "UPDATE JOB"
        })
        if (!roleGuard) {
            return {
                type: "ERROR",
                message: "You are restricted for this action!"
            }
        }
        const jobData = await prisma.jobPost.findFirst({
            where: {
                id: jobID
            }
        })
        if (!jobData) {
            return {
                type: "ERROR",
                message: "Invalid update request made!"
            }
        }
        try {
            const updatedJob = await prisma.jobPost.update({
                where: { id: jobID },
                data: {
                    description
                },
            });
            revalidatePath(`/jobs/${jobID}/description`)
            return {
                type: "SUCCESS",
                message: "Description Updated!",
                data: updatedJob
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

export const updateJobStages = async ({ userID, jobID, jobStages }: { userID: string, jobID: string, jobStages: JobStage[] }) => {
    try {


        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }
        if (user?.id !== userID) {
            throw new Error("Invalid user request")
        }
        const jobData = await prisma.jobPost.findFirst({
            where: {
                id: jobID
            }
        })
        if (!jobData) {
            return {
                type: "ERROR",
                message: "Invalid update request made!"
            }
        }

        const roleGuard = await organizationRoleGuard({
            email: user.email,
            organizationId: jobData.organizationId,
            action: "UPDATE JOB"
        })
        if (!roleGuard) {
            return {
                type: "ERROR",
                message: "You are restricted for this action!"
            }
        }
        const updatedJobStages = jobStages.map((x, index: number) => ({
            id: x.id, // Assuming each `jobStage` has an `id`
            displayOrder: index + 1
        }))

        try {
            const updatedData = await Promise.all(
                updatedJobStages.map((stage) =>
                    prisma.jobStage.update({
                        where: { id: stage.id },
                        data: { displayOrder: stage.displayOrder }
                    })
                )
            )
            revalidatePath(`/jobs/${jobID}`)
            return {
                type: "SUCCESS",
                message: "Success!",
                data: updatedData
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

export const updateJobApplication = async ({ userID, jobID, jobApplication }: { userID: string, jobID: string, jobApplication: JobApplication[] }) => {
    try {
        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }
        if (user?.id !== userID) {
            throw new Error("Invalid user request")
        }
        const jobData = await prisma.jobPost.findFirst({
            where: {
                id: jobID
            }
        })
        if (!jobData) {
            return {
                type: "ERROR",
                message: "Invalid update request made!"
            }
        }

        const roleGuard = await organizationRoleGuard({
            email: user.email,
            organizationId: jobData.id,
            action: "UPDATE JOB"
        })
        if (!roleGuard) {
            return {
                type: "ERROR",
                message: "You are restricted for this action!"
            }
        }

        const updatedJobApplication = jobApplication.map((x, index: number) => ({
            id: x.id, // Assuming each `jobStage` has an `id`
            rule: x.rule
        }))

        try {
            const updatedData = await Promise.all(
                updatedJobApplication.map((application) =>
                    prisma.jobApplication.update({
                        where: { id: application.id },
                        data: { rule: application.rule }
                    })
                )
            )
            revalidatePath(`/jobs/${jobID}/setting/application`)
            return {
                type: "SUCCESS",
                message: "Success!",
                data: updatedData
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

export const addAdditionalQuestions = async ({ userID, jobID, jobApplication }: { userID: string, jobID: string, jobApplication: Omit<JobApplication, 'id' | 'jobId' | 'isDeleted' | 'createdAt'> }) => {
    try {
        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }
        if (user?.id !== userID) {
            throw new Error("Invalid user request")
        }
        const jobData = await prisma.jobPost.findFirst({
            where: {
                id: jobID
            }
        })
        if (!jobData) {
            return {
                type: "ERROR",
                message: "Invalid update request made!"
            }
        }
        const roleGuard = await organizationRoleGuard({
            email: user.email,
            organizationId: jobData.organizationId,
            action: "UPDATE JOB"
        })
        if (!roleGuard) {
            return {
                type: "ERROR",
                message: "You are restricted for this action!"
            }
        }

        try {
            const newAdditionalQuestion = await prisma.jobApplication.create({
                data: {
                    jobId: jobID,
                    label: jobApplication.label,
                    dataType: jobApplication.dataType,
                    option: jobApplication.option,
                    questionType: jobApplication.questionType
                }
            })
            revalidatePath(`/jobs/${jobID}/setting/application`)
            return {
                type: "SUCCESS",
                message: "Success!",
                data: newAdditionalQuestion
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

export const updateAdditionalQuestions = async ({ userID, jobID, jobApplication }: { userID: string, jobID: string, jobApplication: Omit<JobApplication, 'jobId' | 'isDeleted' | 'createdAt'> }) => {
    try {
        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }
        if (user?.id !== userID) {
            throw new Error("Invalid user request")
        }
        const jobData = await prisma.jobPost.findFirst({
            where: {
                id: jobID
            }
        })
        if (!jobData) {
            return {
                type: "ERROR",
                message: "Invalid update request made!"
            }
        }
        const roleGuard = await organizationRoleGuard({
            email: user.email,
            organizationId: jobData.organizationId,
            action: "UPDATE JOB"
        })
        if (!roleGuard) {
            return {
                type: "ERROR",
                message: "You are restricted for this action!"
            }
        }

        try {
            const updateJobAdditionalQuestions = await prisma.jobApplication.update({
                data: {
                    label: jobApplication.label,
                    rule: jobApplication.rule,
                    option: jobApplication.option
                },
                where: {
                    id: jobApplication.id
                }
            })
            revalidatePath(`/jobs/${jobID}/setting/application`)
            return {
                type: "SUCCESS",
                message: "Success!",
                data: updateJobAdditionalQuestions
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

export const updateDeleteStatusAdditionalQuestion = async ({ userID, jobID, questionID, status }: { userID: string, jobID: string, questionID: string, status?: boolean }) => {
    try {
        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }
        if (user?.id !== userID) {
            throw new Error("Invalid user request")
        }
        const jobData = await prisma.jobPost.findFirst({
            where: {
                id: jobID
            }
        })
        if (!jobData) {
            return {
                type: "ERROR",
                message: "Invalid update request made!"
            }
        }
        const roleGuard = await organizationRoleGuard({
            email: user.email,
            organizationId: jobData.organizationId,
            action: "UPDATE JOB"
        })
        if (!roleGuard) {
            return {
                type: "ERROR",
                message: "You are restricted for this action!"
            }
        }

        try {
            const deleteAdditionalQuestions = await prisma.jobApplication.update({
                data: {
                    isDeleted: status ?? true
                },
                where: {
                    id: questionID
                }
            })
            revalidatePath(`/jobs/${jobID}/setting/application`)
            return {
                type: "SUCCESS",
                message: "Success!",
                data: deleteAdditionalQuestions
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

export const moveToStage = async ({ userID, candidateID, stageID, confirmation }: { userID: string, candidateID: string, stageID: string, confirmation?: boolean }) => {
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
            },
            include: {
                formResponses: true,
                jobPost: {
                    include: {
                        organization: true
                    }
                }
            }
        })
        if (!candidateDetails) {
            return {
                type: "ERROR",
                message: "Invalid update request made!"
            }
        }
        const stageDetails = await prisma.jobStage.findFirst({
            where: {
                id: stageID
            }
        })
        const jobID = stageDetails?.jobId
        if (!jobID) {
            return {
                type: "ERROR",
                message: "Invalid update request made!"
            }
        }
        const candidateName = candidateDetails.formResponses.find(x => x.label === "Name")?.value ?? '';
        const jobTitle = candidateDetails.jobPost?.title ?? '';
        const organizationName = candidateDetails.jobPost.organization?.name ?? '';



        if (stageDetails.name === "Archived" && confirmation) {
            const template = await prisma.jobMailingTemplate.findFirst({
                where: {
                    jobId: jobID,
                    name: "Application Rejected"
                }
            })
            const mailingTemplate = template ?? MailingTemplate.find(x => x.name === "Application Rejected")
            const mailingMessage = mailingTemplate?.body
                .replaceAll("{{CandidateName}}", candidateName)
                .replaceAll("{{JobTitle}}", jobTitle)
                .replaceAll("{{OrganizationName}}", organizationName);
            sendEmail({
                to: [candidateDetails.formResponses.filter(x => x.label === "Email")[0]?.value ?? ''],
                from: 'career@requro.com',
                subject: `An updated on your application for ${candidateDetails.jobPost.title}`,
                body: `Hi ${candidateDetails.formResponses.filter(x => x.label === "Name")[0]?.value ?? ''},\n\nWe wanted to inform you that your application for the position of ${candidateDetails.jobPost.title} has been archived. \n\nIf you have any questions or would like to discuss this further, please feel free to reach out.\n\nBest regards,\nThe Requro Team`,
                htmlTemplate: {
                    filePath: path.join(process.cwd(), "mailTemplates", "applicationUpdateTemplate.hbs"),
                    context: {
                        title: `An updated on your application for ${candidateDetails.jobPost.title}`,
                        message: mailingMessage
                    }
                }

            })
        }
        try {
            const updatedCandidateStage = await prisma.candidateApplication.update({
                data: {
                    stageId: stageID,
                    CandidateTimeline: {
                        create: {
                            actionType: "EVENT",
                            timelineText: `${user?.name} moved to ${stageDetails?.name}`,
                            userId: userID,
                            jobId: stageDetails?.jobId as string
                        }
                    }
                },
                where: {
                    id: candidateDetails.id
                }
            })
            // const timelineStatus=await prisma.candidateTimeline.create({
            //     data:{

            //     }
            // })
            revalidatePath(`/jobs/${jobID}/setting/application`)
            return {
                type: "SUCCESS",
                message: "Success!",
                data: updatedCandidateStage
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

export const addComment = async ({ userID, jobID, comment, candidateID }: { userID: string, jobID: string, comment: string, candidateID: string }) => {

    try {


        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }
        if (user?.id !== userID) {
            throw new Error("Invalid user request")
        }

        const jobData = await prisma.jobPost.findFirst({
            where: {
                id: jobID
            }
        })
        if (!jobData) {
            return {
                type: "ERROR",
                message: "Invalid update request made!"
            }
        }
        const candidateDetails = await prisma.candidateApplication.findFirst({
            where: {
                id: candidateID
            }
        })
        if (!candidateDetails) {
            return {
                type: "ERROR",
                message: "Invalid comment request made!"
            }
        }
        try {
            const addComment = await prisma.candidateTimeline.create({
                data: {
                    userId: userID,
                    actionType: "COMMENT",
                    candidateId: candidateID,
                    jobId: jobID,
                    timelineText: `${user?.name} left a comment`,
                    comment: comment
                }
            });
            revalidatePath(`/jobs/${jobID}/stages/${candidateDetails.stageId}/applicants/${candidateID}`)
            return {
                type: "SUCCESS",
                message: "Description Updated!",
                data: addComment
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

export const updateComment = async ({ userID, jobID, comment, candidateID, timelineID }: { userID: string, jobID: string, comment: string, candidateID: string, timelineID: string }) => {

    try {
        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }
        if (user?.id !== userID) {
            throw new Error("Invalid user request")
        }

        const jobData = await prisma.jobPost.findFirst({
            where: {
                id: jobID
            }
        })
        if (!jobData) {
            return {
                type: "ERROR",
                message: "Invalid update request made!"
            }
        }
        const candidateDetails = await prisma.candidateApplication.findFirst({
            where: {
                id: candidateID
            }
        })
        if (!candidateDetails) {
            return {
                type: "ERROR",
                message: "Invalid comment request made!"
            }
        }
        try {
            const addComment = await prisma.candidateTimeline.update({
                data: {
                    comment: comment
                },
                where: {
                    id: timelineID
                }
            });
            revalidatePath(`/jobs/${jobID}/stages/${candidateDetails.stageId}/applicants/${candidateID}`)
            return {
                type: "SUCCESS",
                message: "Description Updated!",
                data: addComment
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

export const deleteComment = async ({ userID, jobID, comment, candidateID, timelineID }: { userID: string, jobID: string, comment: string, candidateID: string, timelineID: string }) => {

    try {
        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }
        if (user?.id !== userID) {
            throw new Error("Invalid user request")
        }

        const jobData = await prisma.jobPost.findFirst({
            where: {
                id: jobID
            }
        })
        if (!jobData) {
            return {
                type: "ERROR",
                message: "Invalid update request made!"
            }
        }
        const candidateDetails = await prisma.candidateApplication.findFirst({
            where: {
                id: candidateID
            }
        })
        if (!candidateDetails) {
            return {
                type: "ERROR",
                message: "Invalid comment request made!"
            }
        }
        try {
            const addComment = await prisma.candidateTimeline.delete({
                where: {
                    id: timelineID
                }
            });
            revalidatePath(`/jobs/${jobID}/stages/${candidateDetails.stageId}/applicants/${candidateID}`)
            return {
                type: "SUCCESS",
                message: "Description Updated!",
                data: addComment
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

export const addJobMailingTemplate = async ({ userID, jobID, templateName, templateSubject, templateBody }: { userID: string, jobID: string, templateName: string, templateSubject: string, templateBody: string }) => {

    try {
        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }
        if (user?.id !== userID) {
            throw new Error("Invalid user request")
        }

        const jobData = await prisma.jobPost.findFirst({
            where: {
                id: jobID
            }
        })
        if (!jobData) {
            return {
                type: "ERROR",
                message: "Invalid update request made!"
            }
        }
        const roleGuard = await organizationRoleGuard({
            email: user.email,
            organizationId: jobData.organizationId,
            action: "UPDATE JOB"
        })
        if (!roleGuard) {
            return {
                type: "ERROR",
                message: "You are restricted for this action!"
            }
        }

        try {
            const addTemplate = await prisma.jobMailingTemplate.create({
                data: {
                    jobId: jobID,
                    name: templateName,
                    subject: templateSubject,
                    body: templateBody
                }
            });
            revalidatePath(`/jobs/${jobID}/setting/mailing-templates`)
            return {
                type: "SUCCESS",
                message: "Description Updated!",
                data: addTemplate
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

export const updateJobMailingTemplate = async ({ userID, jobID, templateId, templateName, templateSubject, templateBody }: { userID: string, jobID: string, templateId: string, templateName: string, templateSubject: string, templateBody: string }) => {

    try {
        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }
        if (user?.id !== userID) {
            throw new Error("Invalid user request")
        }

        const jobData = await prisma.jobPost.findFirst({
            where: {
                id: jobID
            }
        })
        if (!jobData) {
            return {
                type: "ERROR",
                message: "Invalid update request made!"
            }
        }
        const roleGuard = await organizationRoleGuard({
            email: user.email,
            organizationId: jobData.organizationId,
            action: "UPDATE JOB"
        })
        if (!roleGuard) {
            return {
                type: "ERROR",
                message: "You are restricted for this action!"
            }
        }

        try {
            const addTemplate = await prisma.jobMailingTemplate.update({
                where: {
                    id: templateId
                },
                data: {
                    jobId: jobID,
                    name: templateName,
                    subject: templateSubject,
                    body: templateBody
                }
            });
            revalidatePath(`/jobs/${jobID}/setting/mailing-templates`)
            return {
                type: "SUCCESS",
                message: "Description Updated!",
                data: addTemplate
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


export const getOrganization = async ({ userID }: { userID: string }) => {
    const user = await currentUser();
    if (!user?.id) {
        redirect('/login')
    }
    if (userID !== user?.id) {
        redirect('/login')
    }
    const userOrganization = await prisma.organization.findMany({
        where: {
            organizationRole: {
                some: {
                    email: user.email
                }
            }
        },
        include: {
            organizationRole: {
                select: {
                    role: true,
                    user: {
                        select: {
                            email: true,
                            name: true,
                            image: true
                        }
                    }
                },
            }
        }
    })

    return userOrganization

}

