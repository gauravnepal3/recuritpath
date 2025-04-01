import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function GET(req: NextRequest) {


    const bucketName = req.nextUrl.searchParams.get("bucketName");
    const fileKey = req.nextUrl.searchParams.get("fileKey");

    if (!bucketName || !fileKey) {
        return NextResponse.json({ message: "Missing bucketName or fileKey" }, { status: 400 });
    }

    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: fileKey,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // Expires in 1 hour

        NextResponse.json({ url }, { status: 200 });
    } catch (error) {
        console.error("Error generating pre-signed URL:", error);
        NextResponse.json({ error: "Failed to generate pre-signed URL" }, { status: 500 });
    }
}