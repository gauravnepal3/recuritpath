import { Resend } from "resend";
import * as handlebars from "handlebars";
import * as fs from "fs/promises";
import path from "path";

// Outbound mail goes through Resend. SES was dropped because it needs live AWS
// credentials and production-access approval; Resend's free tier (3k/month,
// 100/day) is enough for the demo and needs only a verified sending domain.
//
// NOTE: this covers OUTBOUND only. Receiving candidate replies still depends on
// the SES receipt rule that writes to S3 for /api/emails/webhook — that pipeline
// is unchanged and is not something Resend replaces one-for-one.
const resend = new Resend(process.env.RESEND_API_KEY);

// Must be an address on a domain verified at https://resend.com/domains.
const MAIL_FROM = process.env.MAIL_FROM_ADDRESS ?? "auth@requro.com";

const domain = process.env.NEXT_PUBLIC_APP_URL;

// Next's standalone server runs with cwd = the app directory (/app/apps/main
// in the image), which is where mailTemplates is copied. Every other call site
// resolves templates the same way.
const templatePath = (name: string) =>
  path.join(process.cwd(), "mailTemplates", name);

export interface SendEmailOptions {
  to: string[];
  from?: string;
  subject: string;
  body: string;
  /** Threading target for candidate conversations. */
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

/**
 * Sends one email.
 *
 * Returns an SES-shaped `{ MessageId }` because call sites persist that id on
 * EmailMessage.messageId and match it against inbound In-Reply-To headers.
 * Throws on delivery failure; callers in the auth flows catch it so that a mail
 * outage cannot wedge signup or login.
 */
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
    // Resend requires at least one of html/text; send both when we have both.
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

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await sendEmail({
    to: [email],
    subject: "2FA Code",
    body: `Your 2FA code: ${token}`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;
  await sendEmail({
    to: [email],
    subject: "Reset your password",
    body: `Reset your password: ${resetLink}`,
    htmlTemplate: {
      filePath: templatePath("resetPassword.hbs"),
      context: { resetLink },
    },
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;
  await sendEmail({
    to: [email],
    subject: "Confirm your email",
    body: `Confirm your email: ${confirmLink}`,
    htmlTemplate: {
      filePath: templatePath("signupInvite.hbs"),
      context: { inviteLink: confirmLink },
    },
  });
};
