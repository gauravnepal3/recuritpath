// Object storage client. Points at Cloudflare R2, which speaks the S3 API, so
// the AWS SDK is reused with an endpoint override.
//
// Provider-agnostic on purpose: leaving S3_ENDPOINT unset falls back to real
// AWS S3, so moving back or to another S3-compatible store is a config change,
// not a code change.
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const endpoint = process.env.S3_ENDPOINT || undefined;

const s3Client = new S3Client({
    // R2 ignores regions but the SDK requires one; "auto" is what R2 documents.
    region: process.env.AWS_REGION || (endpoint ? "auto" : "us-east-1"),
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export { s3Client };

export async function generatePresignedUrl(bucketName: string, fileKey: string) {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
