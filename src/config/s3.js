import { S3Client } from '@aws-sdk/client-s3';
import 'dotenv/config';

const isLocalStack = Boolean(process.env.S3_ENDPOINT);

export const s3 = new S3Client({
    region: process.env.AWS_REGION,

    ...(isLocalStack && {
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    }),
});