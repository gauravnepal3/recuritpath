// app/actions/generatePresignedUrl.ts
"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
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
        ACL: "private", // Set the ACL to private for security
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // URL expires in 60 seconds
    return url;
}