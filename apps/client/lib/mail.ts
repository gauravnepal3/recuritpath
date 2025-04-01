import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";
import * as handlebars from "handlebars";
import * as fs from "fs"; // For reading files (e.g., attachments or templates)

const sesClient = new SESClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

interface SendEmailOptions {
  to: string[];
  from: string;
  subject: string;
  body: string;
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
  htmlTemplate,
  attachments,
}: SendEmailOptions) => {
  try {
    // Compile HTML template if provided
    let htmlBody: string | undefined;
    if (htmlTemplate) {
      console.log(htmlTemplate.filePath)
      const templateFile = fs.readFileSync(htmlTemplate.filePath, "utf-8");
      const template = handlebars.compile(templateFile);
      htmlBody = template(htmlTemplate.context || {});
    }

    // Prepare email parameters
    const params: SendEmailCommandInput = {
      Source: from,
      Destination: {
        ToAddresses: to,
      },
      Message: {
        Subject: { Data: subject },
        Body: {
          ...(body && { Text: { Data: body } }), // Include plain text body if provided
          ...(htmlBody && { Html: { Data: htmlBody } }), // Include HTML body if provided
        },
      },
      ...(attachments && {
        // Handle attachments
        RawMessage: {
          Data: await createRawMessageWithAttachments({
            to,
            from,
            subject,
            body,
            htmlBody,
            attachments,
          }),
        },
      }),
    };

    // Send email
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Helper function to create a raw message with attachments
const createRawMessageWithAttachments = async ({
  to,
  from,
  subject,
  body,
  htmlBody,
  attachments,
}: {
  to: string[];
  from: string;
  subject: string;
  body?: string;
  htmlBody?: string;
  attachments: { filename: string; path: string }[];
}) => {
  // @ts-ignore
  const mailcomposer = await import("mailcomposer"); // Use mailcomposer to handle attachments
  const mail = new mailcomposer.default({
    from,
    to,
    subject,
    text: body,
    html: htmlBody,
    attachments: attachments.map((attachment) => ({
      filename: attachment.filename,
      path: attachment.path,
    })),
  });

  return new Promise((resolve, reject) => {
    mail.build((err: any, message: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(message);
      }
    });
  });
};

