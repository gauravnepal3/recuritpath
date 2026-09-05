import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { simpleParser } from "mailparser";
import { prisma } from "@repo/database";

// NOTE: inbound mail is written into this bucket by an SES receipt rule, which
// cannot write to R2. This route only works while that bucket is still on AWS.
const s3 = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    ...(process.env.INBOUND_S3_ENDPOINT ? { endpoint: process.env.INBOUND_S3_ENDPOINT, forcePathStyle: true } : {}),
});
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const S3_BUCKET_NAME = process.env.AWS_EMAIL_S3_BUCKET_NAME; // Store in .env

export const POST = async (req: NextRequest) => {
    try {
        // ✅ Authentication check
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
            console.error("Unauthorized access attempt");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ✅ Parse request body
        const { messageId } = await req.json();
        if (!messageId) {
            console.error("Missing messageId");
            return NextResponse.json({ error: "Missing messageId" }, { status: 400 });
        }

        console.log(`Fetching email from S3 using messageId: ${messageId}`);

        // ✅ Fetch email content from S3 (messageId is the key)
        const command = new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: `mail/${messageId}` });
        const { Body } = await s3.send(command);

        if (!Body) {
            console.error("Empty email content");
            return NextResponse.json({ error: "Empty email content" }, { status: 400 });
        }

        // ✅ Convert stream to string & parse email
        const emailContent = await Body.transformToString();

        const parsedEmail = await simpleParser(emailContent);
        console.log(parsedEmail)
        const { from, to, subject, text, html, inReplyTo } = parsedEmail;

        const fromText = Array.isArray(from) ? from.map(f => f.text).join(", ") : from?.text;
        const toText = Array.isArray(to) ? to.map(t => t.text).join(", ") : to?.text;
        console.log(`Email Parsed: From=${fromText}, To=${toText}, Subject=${subject}`);

        // ✅ Extract Candidate ID from hidden metadata
        let candidateId: string | null = null;
        let userId: string | null = null;
        // Try extracting from HTML content first
        const candidateIdMatch = /\[Candidate-ID:\s*([a-zA-Z0-9_-]+)\]/i.exec(html || "");
        if (candidateIdMatch) {
            candidateId = candidateIdMatch[1] ?? null;
        } else {
            // 🔹 Fallback: Try extracting from plain text (if HTML parsing fails)
            const fallbackMatch = /\[Candidate-ID:\s*([a-zA-Z0-9_-]+)\]/i.exec(text || "");
            if (fallbackMatch) {
                candidateId = fallbackMatch[1] ?? null;
            }
        }
        const userMatch = /\[User-ID:\s*([a-zA-Z0-9_-]+)\]/i.exec(html || "");
        if (userMatch) {
            userId = userMatch[1] ?? null;
        } else {
            // 🔹 Fallback: Try extracting from plain text (if HTML parsing fails)
            const fallbackMatch = /\[User-ID:\s*([a-zA-Z0-9_-]+)\]/i.exec(text || "");
            if (fallbackMatch) {
                userId = fallbackMatch[1] ?? null;
            }
        }

        console.log(`Extracted Candidate ID: ${candidateId || "Not Found"}`);


        // ✅ Identify parent email if it's a reply
        const parentMessage = inReplyTo
            ? await prisma.emailMessage.findUnique({ where: { messageId: inReplyTo } })
            : null;

        // ✅ Identify sender & recipient
        const senderEmail = from?.value?.[0]?.address;
        const recipientEmail = Array.isArray(to) ? to[0]?.value[0]?.address : to?.value[0]?.address;

        if (!senderEmail || !recipientEmail) {
            console.error("Missing sender or recipient");
            return NextResponse.json({ error: "Missing sender or recipient" }, { status: 400 });
        }

        // ✅ Lookup user (recruiter)
        const user = await prisma.user.findFirst({ where: { id: userId ?? '' } });

        console.log(`Sender: ${senderEmail}, Recipient: ${recipientEmail}, User ID: ${user?.id || "Unknown"}`);

        // ✅ Save email in DB
        await prisma.emailMessage.create({
            data: {
                messageId,
                parentMessageId: parentMessage ? parentMessage.messageId : null,
                sender: senderEmail,
                recipient: recipientEmail,
                subject: subject ?? '',
                body: (html || text) ?? '',
                s3Url: `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${messageId}`,
                direction: "RECEIVED",
                userId: user ? user.id : "UNKNOWN",
                candidateId: candidateId || "UNKNOWN",
            },
        });

        console.log("✅ Email saved successfully!");
        return NextResponse.json({ message: "Email saved successfully" });
    } catch (error) {
        console.error("🚨 Error processing email:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};
