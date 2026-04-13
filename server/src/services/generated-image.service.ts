import path from "node:path";
import {
  deleteObject,
  getObjectFile,
  listObjects,
  saveObject,
} from "../fileStorage/fileStorage.js";
import type { StreamableFile } from "../lib/files.js";
import type { CatalogKind } from "../models/catalog.model.js";
import { extensionFromMime, inferMimeTypeFromFileName, slugify } from "./catalog.service.js";

export function generatedImageUrl(fileName: string): string {
  return `/generated/${fileName}`;
}

export function sanitizeGeneratedFileName(fileName: string): string | null {
  const normalized = fileName.trim();
  if (!/^[a-z0-9-]+__[a-z0-9-]+\.(png|jpg|jpeg|webp|avif)$/i.test(normalized)) {
    return null;
  }

  return normalized;
}

export async function writeGeneratedImage(input: {
  carName: string;
  wrapName: string;
  bytes: Buffer;
  mimeType: string;
}): Promise<string> {
  const prefix = combinationPrefix(input.carName, input.wrapName);
  const extension = extensionFromMime(input.mimeType);
  const fileName = `${prefix}${extension}`;
  const objectPath = `generated/${fileName}`;

  const existingFiles = await listObjects({
    prefix: `generated/${prefix}.`,
  });

  await Promise.all(
    existingFiles.map(async (existingFile) => {
      const existingFileName = path.posix.basename(existingFile.name);
      if (existingFileName !== fileName) {
        await deleteObject(existingFile.name);
      }
    }),
  );

  await saveObject(
    objectPath,
    input.bytes,
    input.mimeType,
    "public, max-age=31536000, immutable",
  );

  return generatedImageUrl(fileName);
}

export async function findGeneratedImage(
  carName: string,
  wrapName: string,
): Promise<string | null> {
  const prefix = combinationPrefix(carName, wrapName);
  const files = await listObjects({
    prefix: `generated/${prefix}.`,
    maxResults: 1,
  });

  const match = files[0];
  if (!match) {
    return null;
  }

  return generatedImageUrl(path.posix.basename(match.name));
}

export async function deleteGeneratedImagesForCatalogItem(
  kind: CatalogKind,
  label: string,
): Promise<void> {
  const slug = slugify(label);

  if (kind === "cars") {
    const files = await listObjects({
      prefix: `generated/${slug}__`,
    });
    await Promise.all(files.map(async (file) => deleteObject(file.name)));
    return;
  }

  const files = await listObjects({
    prefix: "generated/",
  });

  const wrapPattern = new RegExp(
    `__${escapeRegExp(slug)}\\.(png|jpg|jpeg|webp|avif)$`,
    "i",
  );
  const matches = files.filter((file) =>
    wrapPattern.test(path.posix.basename(file.name)),
  );

  await Promise.all(matches.map(async (file) => deleteObject(file.name)));
}

export async function getGeneratedImageFile(
  fileName: string,
): Promise<StreamableFile | null> {
  return getObjectFile(
    `generated/${fileName}`,
    inferMimeTypeFromFileName(fileName),
  );
}

function combinationPrefix(carName: string, wrapName: string): string {
  return `${slugify(carName)}__${slugify(wrapName)}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
