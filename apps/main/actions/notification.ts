"use server"
import { currentUser } from "@/lib/auth";
import { organizationRoleGuard } from "@/lib/utils";
import { prisma } from "@repo/database";
type NotificationType =
    {
        message: string,
        userID?: string,
        organizationID?: string,
        category: string
        priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL",
        type: "PERSONAL" | "ORGANIZATION",
        actionUrl: string,
        notificationPermission: "ADMIN" | "OWNER" | "ALL" | "INTERVIEWER"
    }
type NotificationReceiptType = {
    success: boolean,
    message: string,
    notificationId: string,
}

export const addNotification = async ({
    message,
    category,
    notificationPermission,
    priority,
    type,
    actionUrl,
    userID,
    organizationID
}: NotificationType): Promise<NotificationReceiptType> => {
    try {
        const notificationMessage = await prisma.notification.create({
            data: {
                message: message,
                type: type,
                category: category,
                actionUrl: actionUrl,
                priority: priority,
            }
        })
        console.log(type)
        if (type === "PERSONAL" && userID) {
            await prisma.notificationReceipt.create({
                data: {
                    userId: userID,
                    notificationId: notificationMessage.id,
                }
            })
        }
        if (type === "ORGANIZATION") {
            console.log(organizationID)
            if (!organizationID) {
                throw new Error("organizationID is required for ORGANIZATION type notifications");
            }
            const organizationUsers = await getOrganizationMembersByRole(organizationID, notificationPermission);

            const recipentData = organizationUsers
                .filter((user) => user.userId !== null)
                .map((user) => ({
                    userId: user.userId as string,
                    notificationId: notificationMessage.id,
                }))
            await prisma.notificationReceipt.createMany({
                data: recipentData
            })
        }
        return {
            success: true,
            message: "Notification added successfully",
            notificationId: notificationMessage.id
        }
    } catch (e) {
        console.error("Error adding notification: ", e)
        return {
            success: false,
            message: "Error adding notification",
            notificationId: "",
        }
    }

}


export const getNotificationByUser = async (userId: string) => {
    try {
        const user = await currentUser();
        if (!user) {
            throw new Error("User not found");
        }
        const notifications = await prisma.notificationReceipt.findMany({
            where: {
                userId: userId
            },
            include: {
                notification: true
            }
        })
        return notifications.map((notification) => ({
            ...notification.notification,
            id: notification.id,
            userId: notification.userId,
        }))
    } catch (e) {
        console.error("Error fetching notifications: ", e)
        return []
    }
}

const getOrganizationMembersByRole = async (organizationId: string, role: string) => {
    if (role === "ALL") {
        return await prisma.organizationUserRole.findMany({
            where: {
                organizationId: organizationId,
                status: "ACTIVE"
            }
        })
    }

    return await prisma.organizationUserRole.findMany({
        where: {
            organizationId: organizationId,
            role: role as any,
            status: "ACTIVE"
        }
    })
}