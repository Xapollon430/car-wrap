import { Storage, type Bucket } from "@google-cloud/storage";
import { downloadBucketObject, getBucketObjectFile } from "../lib/bucket.js";
import type { StreamableFile } from "../lib/files.js";

const storage = new Storage();

export function getStorageBucket(): Bucket {
  const bucketName = (process.env.FIREBASE_STORAGE_BUCKET ?? "").trim();
  if (!bucketName) {
    throw new Error("FIREBASE_STORAGE_BUCKET is required");
  }

  return storage.bucket(bucketName);
}

export async function createUploadUrl(
  objectPath: string,
  contentType: string,
): Promise<string> {
  const [url] = await getStorageBucket().file(objectPath).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 10 * 60 * 1000,
    contentType,
  });

  return url;
}

export async function objectExists(objectPath: string): Promise<boolean> {
  const [exists] = await getStorageBucket().file(objectPath).exists();
  return exists;
}

export async function saveObject(
  objectPath: string,
  bytes: Buffer,
  contentType: string,
  cacheControl: string,
): Promise<void> {
  await getStorageBucket().file(objectPath).save(bytes, {
    resumable: false,
    contentType,
    metadata: {
      cacheControl,
    },
  });
}

export async function deleteObject(objectPath: string): Promise<void> {
  await getStorageBucket().file(objectPath).delete({
    ignoreNotFound: true,
  });
}

export async function listObjects(input: {
  prefix: string;
  maxResults?: number;
}) {
  const [files] = await getStorageBucket().getFiles({
    prefix: input.prefix,
    maxResults: input.maxResults,
  });

  return files;
}

export async function getObjectFile(
  objectPath: string,
  fallbackMimeType: string,
  fallbackCacheControl?: string,
): Promise<StreamableFile | null> {
  return getBucketObjectFile(
    getStorageBucket(),
    objectPath,
    fallbackMimeType,
    fallbackCacheControl,
  );
}

export async function downloadObject(objectPath: string): Promise<Buffer> {
  return downloadBucketObject(getStorageBucket(), objectPath);
}
