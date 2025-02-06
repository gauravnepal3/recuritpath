import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextApiRequest, NextApiResponse } from "next";

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const bucketName = Array.isArray(req.query.bucketName) ? req.query.bucketName[0] : req.query.bucketName;
    const fileKey = Array.isArray(req.query.fileKey) ? req.query.fileKey[0] : req.query.fileKey;

    if (!bucketName || !fileKey) {
        return res.status(400).json({ message: "Missing bucketName or fileKey" });
    }

    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: fileKey,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // Expires in 1 hour

        res.status(200).json({ url });
    } catch (error) {
        console.error("Error generating pre-signed URL:", error);
        res.status(500).json({ message: "Failed to generate pre-signed URL" });
    }
}