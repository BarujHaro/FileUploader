import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { s3 } from '../config/s3.js';
import 'dotenv/config';


export async function uploadToS3(file) {
    const key =
        `${randomUUID()}${path.extname(file.originalname)}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        })
    );

    return {
        key,
        originalName: file.originalname,
        size: file.size,
        contentType: file.mimetype,
        storage: 's3'
    };
}