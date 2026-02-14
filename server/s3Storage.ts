/**
 * S3 Storage Module for Growth Cards
 * 
 * Handles uploading Growth Card images to AWS S3 for permanent storage.
 * Falls back to local storage if S3 credentials are not configured.
 */

import { ENV } from './_core/env';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
}

/**
 * Check if S3 is configured via environment variables
 */
export function isS3Configured(): boolean {
  return !!(
    ENV.awsAccessKeyId &&
    ENV.awsSecretAccessKey &&
    ENV.awsS3BucketName &&
    ENV.awsS3Region
  );
}

/**
 * Get S3 configuration from environment variables
 */
function getS3Config(): S3Config | null {
  if (!isS3Configured()) {
    return null;
  }
  
  return {
    accessKeyId: ENV.awsAccessKeyId!,
    secretAccessKey: ENV.awsSecretAccessKey!,
    bucketName: ENV.awsS3BucketName!,
    region: ENV.awsS3Region!,
  };
}

/**
 * Upload a buffer to S3 and return the public URL
 */
async function uploadToS3(
  buffer: Buffer,
  filename: string,
  contentType: string = 'image/png'
): Promise<string> {
  const config = getS3Config();
  if (!config) {
    throw new Error('S3 is not configured');
  }
  
  // Use AWS SDK v3 (lightweight, modern)
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  
  const client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  
  const key = `growth-cards/${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read', // Make the file publicly accessible
  });
  
  await client.send(command);
  
  // Return the public URL
  const url = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`;
  return url;
}

/**
 * Save buffer to local filesystem (fallback when S3 is not configured)
 */
async function saveToLocalStorage(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const uploadsDir = join(process.cwd(), 'uploads', 'growth-cards');
  await mkdir(uploadsDir, { recursive: true });
  
  const filepath = join(uploadsDir, filename);
  await writeFile(filepath, buffer);
  
  // Return relative URL (served by Express static middleware)
  return `/uploads/growth-cards/${filename}`;
}

/**
 * Save a Growth Card image and return its URL
 * 
 * Automatically uses S3 if configured, otherwise falls back to local storage.
 * 
 * @param buffer - Image buffer (PNG, WebP, etc.)
 * @param userId - User ID (for filename uniqueness)
 * @param conversationId - Conversation ID (for filename uniqueness)
 * @param format - Image format (png, webp, jpg)
 * @returns Public URL of the saved image
 */
export async function saveGrowthCardImage(
  buffer: Buffer,
  userId: number,
  conversationId: number,
  format: 'png' | 'webp' | 'jpg' = 'png'
): Promise<string> {
  const timestamp = Date.now();
  const filename = `card-${userId}-${conversationId}-${timestamp}.${format}`;
  
  const contentType = {
    png: 'image/png',
    webp: 'image/webp',
    jpg: 'image/jpeg',
  }[format];
  
  if (isS3Configured()) {
    console.log(`[S3Storage] Uploading ${filename} to S3...`);
    try {
      const url = await uploadToS3(buffer, filename, contentType);
      console.log(`[S3Storage] Successfully uploaded to ${url}`);
      return url;
    } catch (error) {
      console.error('[S3Storage] Failed to upload to S3, falling back to local storage:', error);
      return await saveToLocalStorage(buffer, filename);
    }
  } else {
    console.log(`[S3Storage] S3 not configured, using local storage for ${filename}`);
    return await saveToLocalStorage(buffer, filename);
  }
}
