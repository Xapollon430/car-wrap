import type { Bucket } from "@google-cloud/storage";
import type { StreamableFile } from "./files.js";

export async function getBucketObjectFile(
  bucket: Bucket,
  objectPath: string,
  fallbackMimeType: string,
  fallbackCacheControl = "public, max-age=86400",
): Promise<StreamableFile | null> {
  const file = bucket.file(objectPath);
  const [exists] = await file.exists();
  if (!exists) {
    return null;
  }

  const [metadata] = await file.getMetadata();
  return {
    mimeType: metadata.contentType || fallbackMimeType,
    cacheControl: metadata.cacheControl ?? fallbackCacheControl,
    stream: file.createReadStream(),
  };
}

export async function downloadBucketObject(
  bucket: Bucket,
  objectPath: string,
): Promise<Buffer> {
  const file = bucket.file(objectPath);
  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`missing source image: ${objectPath}`);
  }

  const [bytes] = await file.download();
  return bytes;
}
