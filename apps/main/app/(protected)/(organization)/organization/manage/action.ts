"use server"
import { prisma } from '@repo/database'
import { z } from "zod"
import { currentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'


const FormSchema = z.object({
    organizationName: z.string().min(1, {
        message: "Name is required",
    }),
})

type OrganizationFormData = z.infer<typeof FormSchema>

interface ActionResponse {
    type: "SUCCESS" | "ERROR",
    message: string
}
export const createOrganization = async (userID: string, organizationName: string): Promise<ActionResponse> => {
    try {

        const user = await currentUser();
        if (!user?.id) {
            redirect('/login')
        }

        const rawData = {
            name: organizationName
        }
        const createNewOrganization = await prisma.organization.create({
            data: rawData
        }
        )
        const addOwnerDetails = await prisma.organizationUserRole.create({
            data: {
                organizationId: createNewOrganization.id,
                role: "OWNER",
                userId: user.id
            }
        })
        const addActionLog = await prisma.organizationActivityLog.create({
            data: {
                organizationId: createNewOrganization.id,
                action: `${user.email} just created ${createNewOrganization.name}`
            }
        })
        revalidatePath('/organization/manage')
        return {
            type: "SUCCESS",
            message: "Success"
        }
    } catch (err) {
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
