import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import 'dotenv/config';

import {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand
} from '@aws-sdk/client-s3';

import { s3 } from '../config/s3.js';

const driver = process.env.STORAGE_DRIVER;

const uploadDirectory = path.resolve(
    process.cwd(),
    'public/upload'
);

const bucket = process.env.S3_BUCKET;

// Guarda el archivo
export async function saveFile(file) {
    const extension = path.extname(file.originalname);
    const key = `${randomUUID()}${extension}`;

    if (driver === 's3') {
        await s3.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        }));
    } else {
        await fs.mkdir(uploadDirectory, { recursive: true });

        await fs.writeFile(
            path.join(uploadDirectory, key),
            file.buffer
        );
    }

    return {
        storage: driver,
        storageKey: key,
        url: driver === 'local' ? `/upload/${key}` : key
    };
}

// Obtiene el contenido del archivo
export async function getFile(storage, key) {
    if (storage === 's3') {
        const response = await s3.send(new GetObjectCommand({
            Bucket: bucket,
            Key: key
        }));

        return Buffer.from(await response.Body.transformToByteArray());
    }

    return fs.readFile(path.join(uploadDirectory, key));
}

// Elimina el archivo
export async function removeFile(storage, key) {
    if (storage === 's3') {
        await s3.send(new DeleteObjectCommand({
            Bucket: bucket,
            Key: key
        }));
    } else {
        await fs.unlink(path.join(uploadDirectory, key));
    }
}