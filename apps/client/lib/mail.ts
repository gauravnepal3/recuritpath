import { Resend } from "resend";
import * as handlebars from "handlebars";
import * as fs from "fs/promises";

// Outbound mail via Resend — see apps/main/lib/mail.ts for the rationale.
// This app only sends the candidate "thank you for applying" acknowledgement.
const resend = new Resend(process.env.RESEND_API_KEY);

const MAIL_FROM = process.env.MAIL_FROM_ADDRESS ?? "auth@requro.com";

export interface SendEmailOptions {
    to: string[];
    from?: string;
    subject: string;
    body: string;
    replyTo?: string;
    htmlTemplate?: {
        filePath: string;
        context?: Record<string, any>;
    };
    attachments?: {
        filename: string;
        path: string;
    }[];
}

export const sendEmail = async ({
    to,
    from,
    subject,
    body,
    replyTo,
    htmlTemplate,
    attachments,
}: SendEmailOptions) => {
    let html: string | undefined;
    if (htmlTemplate) {
        const templateFile = await fs.readFile(htmlTemplate.filePath, "utf-8");
        html = handlebars.compile(templateFile)(htmlTemplate.context ?? {});
    }

    const resolvedAttachments = attachments?.length
        ? await Promise.all(
            attachments.map(async (a) => ({
                filename: a.filename,
                content: await fs.readFile(a.path),
            }))
        )
        : undefined;

    const { data, error } = await resend.emails.send({
        from: from || MAIL_FROM,
        to,
        subject,
        ...(html ? { html } : {}),
        ...(body ? { text: body } : {}),
        ...(!html && !body ? { text: " " } : {}),
        ...(replyTo ? { replyTo } : {}),
        ...(resolvedAttachments ? { attachments: resolvedAttachments } : {}),
    } as Parameters<typeof resend.emails.send>[0]);

    if (error) {
        console.error("Error sending email:", error);
        throw new Error(`${error.name}: ${error.message}`);
    }

    return { MessageId: data?.id, id: data?.id };
};
