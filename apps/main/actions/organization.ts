'use server'
import { currentUser } from "@/lib/auth";
import { sendEmail } from "@/lib/mail";
import { Organization, prisma } from "@repo/database"
import { revalidatePath } from "next/cache";
import { NEXT_URL } from "next/dist/client/components/app-router-headers";
import { redirect } from "next/navigation";
import path from "path";
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { writeFile } from "fs/promises";
import { s3Client } from "@/lib/s3";
import { organizationRoleGuard, userDetails } from "@/lib/utils";
import jwt from "jsonwebtoken"
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

export const updateOrganizationName = async ({ organizationName, organizationId }: { organizationName: string, organizationId: string }): Promise<SuccessResponse<Organization> | ErrorResponse> => {
    const user = await currentUser();
    if (!user?.id) {
        redirect('/login')
    }
    const organizationDetails = await prisma.organization.findFirst({
        where: {
            id: organizationId
        }
    })
    if (!organizationDetails) {
        return {
            type: "ERROR",
            message: "Invalid request"
        }
    }
    const updatedOrganizaiton = await prisma.organization.update({
        where: {
            id: organizationId
        },
        data: {
            name: organizationName
        }
    })
    revalidatePath(`/account/organization`)
    return {
        type: 'SUCCESS',
        message: 'Success',
        data: updatedOrganizaiton
    }

}





const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const FOLDER_NAME = "public-folder"; // Folder inside S3 bucket

export async function uploadOrganizationImage({ organizationId, file }: { organizationId: string, file: File }): Promise<SuccessResponse<Organization> | ErrorResponse> {
    if (!organizationId || !file) throw new Error("Invalid input: organizationId and file are required.");

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop();
    const newFileName = `${organizationId}-${uuidv4()}.${fileExtension}`;
    const newFileKey = `${FOLDER_NAME}/${newFileName}`;

    try {
        // 🔹 Step 1: Find Existing Image (If Any)
        const listCommand = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: `${FOLDER_NAME}/${organizationId}-`,
        });

        const { Contents } = await s3Client.send(listCommand);
        if (Contents && Contents.length > 0) {
            // 🔹 Step 2: Delete Old Image
            for (const obj of Contents) {
                if (obj.Key) {
                    await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: obj.Key }));
                }
            }
        }

        // 🔹 Step 3: Upload New Image
        const putCommand = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: newFileKey,
            Body: fileBuffer,
            ContentType: file.type,
        });

        await s3Client.send(putCommand);

        // 🔹 Step 4: Revalidate Cache (Optional)
        revalidatePath("/account/organization"); // Change this to the correct path where the image is displayed

        const updatedOrganization = await prisma.organization.update({
            where: {
                id: organizationId
            },
            data: {
                logo: newFileName
            }
        })
        return { type: 'SUCCESS', message: 'Success', data: updatedOrganization };
    } catch (error) {
        console.error("S3 Upload Error:", error);
        return {
            message: "Error",
            type: "ERROR"
        }
        throw new Error("Failed to upload image");
    }
}


import { OrganizationRole } from "@repo/database";

export async function addTeamMember({ organizationId, userId, email, role }: { organizationId: string, userId: string, email: string, role: OrganizationRole }): Promise<SuccessResponse<any> | ErrorResponse> {
    try {

        const user = await userDetails();
        const organizationDetails = await prisma.organization.findFirst({
            where: {
                id: organizationId
            }
        })
        if (!organizationDetails) {
            return {
                type: "ERROR",
                message: "Invalid request made!"
            }
        }
        const roleGuard = await organizationRoleGuard({
            action: "ADD MEMBER",
            organizationId: organizationId,
            email: user.email
        })
        if (!roleGuard) {
            return {
                type: "ERROR",
                message: "403 Unauthorized action. Contact the owner."
            }
        }
        console.log({
            role: role.toLocaleUpperCase() as OrganizationRole,
            organizationId: organizationDetails.id,
            email: email,
            status: "PENDING"
        })
        const addTeamMember = await prisma.organizationUserRole.create({
            data: {
                role: role.toLocaleUpperCase() as OrganizationRole,
                organizationId: organizationDetails.id,
                email: email,
                status: "PENDING"
            }
        })
        await sendEmail({
            to: [email],
            body: '',
            from: "career@requro.com",
            subject: "You're invited.",
            htmlTemplate: {
                filePath: path.join(process.cwd(), "mailTemplates", "inviteOrganization.hbs"),
                context: {
                    companyLogo: `${process.env.S3_PUBLIC_URL}/${organizationDetails.logo}`,
                    email: email,
                    companyName: organizationDetails.name,
                    role: role,
                    acceptLink: generateInviteLink(addTeamMember.id, email, organizationDetails.id)
                }
            }
        })
        revalidatePath(`/organization/setting`)
        return {
            type: "SUCCESS",
            message: "SUCCESS",
            data: addTeamMember
        }

    } catch (err) {
        console.log(err)
        return {
            type: "ERROR",
            message: "Something went wrong!"
        }
    }
}

const generateInviteLink = (inviteID: string, email: string, organizationId: string) => {
    const token = jwt.sign({
        inviteId: inviteID,
        email: email,
        organization: organizationId
    }, `${process.env.AUTH_SECRET}`)
    return `${process.env.NEXT_PUBLIC_APP_URL}/api/organization/invite?inviteId=${token}`
}


