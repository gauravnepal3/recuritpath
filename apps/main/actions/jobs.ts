"use server"
import { JobApplication, JobPost, JobStage, prisma } from '@repo/database'
import { z } from "zod"
import { currentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { X } from 'lucide-react'


const FormSchema = z.object({
    title: z.string().min(1, {
        message: "Name is required",
    }),
})

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

export const createJobPost = async <T>(userID: string, title: string, organizationID: string): Promise<SuccessResponse<T> | ErrorResponse> => {
    try {

        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }

        const getOrganizationDetails = await prisma.organization.findFirst({
            where: {
                id: organizationID
            },
            include: {
                organizationRole: {
                    where: {
                        userId: userID
                    },
                    select: {
                        role: true
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

        if (getOrganizationDetails.organizationRole[0].role !== "OWNER") {
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
            include: {
                organizationRole: {
                    where: {
                        userId: userID
                    },
                    select: {
                        role: true
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

        if (getOrganizationDetails.organizationRole[0].role !== "OWNER") {
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
            include: {
                organizationRole: {
                    where: {
                        userId: userID
                    },
                    select: {
                        role: true
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

        if (getOrganizationDetails.organizationRole[0].role !== "OWNER") {
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
                    userId: userID
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

