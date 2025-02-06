// lib/s3.js (Utility function for generating pre-signed URLs)
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function generatePresignedUrl(bucketName: string, fileKey: string) {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}