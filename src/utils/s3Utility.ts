import { S3 } from 'aws-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const S3_BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
const s3 = new S3({
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
});

export async function listObjectsInS3(prefix: string): Promise<(string | undefined)[]> {
    const result = await s3.listObjectsV2({
        Bucket: S3_BUCKET_NAME,
        Prefix: prefix
    }).promise();

    return result.Contents ? result.Contents.map(obj => obj.Key) : [];
}

export async function getRandomImageFromSubfolder(subfolderName: string): Promise<string | null> {
    const files = await listObjectsInS3(`${subfolderName}/`);
    if (!files.length) {
        return null;
    }
    return files[Math.floor(Math.random() * files.length)] || null;
}

export async function getImageDataFromS3(imagePath: string): Promise<S3.GetObjectOutput> {
    return s3.getObject({
        Bucket: S3_BUCKET_NAME,
        Key: imagePath
    }).promise();
}

export async function getCountOfImagesInSubfolder(subfolderName: string): Promise<number> {
    const files = await listObjectsInS3(`${subfolderName}/`);
    return files.length;
}
