import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, S3ClientConfig } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import config from './config';

// Configure S3 client
const s3Config: S3ClientConfig = {
  endpoint: `http${config.storage.useSSL ? 's' : ''}://${config.storage.endpoint}:${config.storage.port}`,
  forcePathStyle: true, // Required for MinIO
  region: config.storage.region,
  credentials: {
    accessKeyId: config.storage.accessKey,
    secretAccessKey: config.storage.secretKey,
  },
};

if (config.storage.useSSL) {
  s3Config.sslVerify = false; // Only for development with self-signed certificates
}

const s3Client = new S3Client(s3Config);

/**
 * Upload a file to S3/MinIO
 */
export async function uploadFile(
  file: Buffer | Readable | string,
  key: string,
  contentType: string,
  metadata: Record<string, string> = {}
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: config.storage.bucket,
    Key: key,
    Body: file,
    ContentType: contentType,
    Metadata: metadata,
  });

  await s3Client.send(command);
  return key;
}

/**
 * Get a file from S3/MinIO
 */
export async function getFile(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: config.storage.bucket,
    Key: key,
  });

  const response = await s3Client.send(command);
  
  if (!response.Body) {
    throw new Error('Empty response body');
  }

  const chunks: Buffer[] = [];
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}

/**
 * Generate a signed URL for a file
 */
export async function getSignedFileUrl(
  key: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: config.storage.bucket,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a file from S3/MinIO
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: config.storage.bucket,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * List files in a directory (prefix) in S3/MinIO
 */
export async function listFiles(prefix: string): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: config.storage.bucket,
    Prefix: prefix,
  });

  const response = await s3Client.send(command);
  return response.Contents?.map((item) => item.Key || '') || [];
}

/**
 * Check if a file exists in S3/MinIO
 */
export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new GetObjectCommand({
      Bucket: config.storage.bucket,
      Key: key,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === 'NoSuchKey' || error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

/**
 * Generate a unique key for a file
 * Format: {userId}/{timestamp}-{random}-{filename}
 */
export function generateFileKey(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-]/g, '_');
  return `${userId}/${timestamp}-${random}-${safeFileName}`;
}
