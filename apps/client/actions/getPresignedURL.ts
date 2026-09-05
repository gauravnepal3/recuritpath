"use server";

// Upload URLs for candidate résumés. Targets Cloudflare R2 via the S3 API —
// see apps/main/lib/s3.ts for why this stays provider-agnostic.
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.S3_ENDPOINT || undefined;

const s3Client = new S3Client({
    region: process.env.AWS_REGION || (endpoint ? "auto" : "us-east-1"),
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function generatePresignedUrl(fileName: string, fileType: string) {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `uploads/${fileName}`,
        ContentType: fileType,
        // No ACL: R2 rejects the S3 ACL header outright, and its buckets are
        // private by default, so the old ACL:"private" was both redundant and
        // fatal here.
    });

    // The browser PUTs straight to this URL, so it must outlive a slow upload
    // on a poor connection; 60s was too tight for a multi-MB résumé.
    return await getSignedUrl(s3Client, command, { expiresIn: 300 });
}
