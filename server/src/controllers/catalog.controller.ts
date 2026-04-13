import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import { badRequest, notFound } from "../lib/errors.js";
import { sendStreamFile } from "../lib/http.js";
import {
  assertCatalogMediaUploaded,
  createCatalogUpload,
  deleteCatalogMedia,
  extensionFromUpload,
  getCatalog,
  getCatalogMediaFile,
  isAllowedImageMime,
  normalizeMimeType,
  parseCatalogKind,
  removeCatalogItem,
  sanitizeCatalogFileName,
  sanitizeCatalogItemId,
  slugify,
  upsertCatalogItem,
} from "../services/catalog.service.js";
import { deleteGeneratedImagesForCatalogItem } from "../services/generated-image.service.js";

export async function getCatalogController(_req: Request, res: Response) {
  res.json(await getCatalog());
}

export async function createCatalogUploadController(req: Request, res: Response) {
  const kind = parseCatalogKind(readParam(req.params.kind));
  if (!kind) {
    throw badRequest("kind must be cars or wraps");
  }

  const label = readRequiredString(req.body, "name");
  const rawFileName = readRequiredString(req.body, "fileName");
  const providedContentType = readRequiredString(req.body, "contentType");
  const id = slugify(label);
  const extension = extensionFromUpload(rawFileName, providedContentType);
  const mimeType = normalizeMimeType(providedContentType, extension);

  if (!isAllowedImageMime(mimeType)) {
    throw badRequest("image must be png/jpg/webp/avif");
  }

  res.json(
    await createCatalogUpload({
      kind,
      id,
      label,
      fileName: `${id}${extension}`,
      mimeType,
    }),
  );
}

export async function commitCatalogItemController(req: Request, res: Response) {
  const kind = parseCatalogKind(readParam(req.params.kind));
  if (!kind) {
    throw badRequest("kind must be cars or wraps");
  }

  const label = readRequiredString(req.body, "name");
  const fileName = sanitizeCatalogFileName(readRequiredString(req.body, "fileName"));
  if (!fileName) {
    throw badRequest("valid fileName is required");
  }

  const id = slugify(label);
  if (path.parse(fileName).name !== id) {
    throw badRequest("fileName does not match name slug");
  }

  const extension = path.extname(fileName).toLowerCase();
  const mimeType = normalizeMimeType(readString(req.body, "mimeType"), extension);

  await assertCatalogMediaUploaded(kind, fileName);

  const result = await upsertCatalogItem({
    kind,
    id,
    label,
    fileName,
    mimeType,
  });

  res.status(result.created ? 201 : 200).json({
    item: {
      id: result.item.id,
      label: result.item.label,
      imagePath: `/catalog-media/${kind}/${encodeURIComponent(result.item.fileName)}`,
    },
  });
}

export async function deleteCatalogItemController(req: Request, res: Response) {
  const kind = parseCatalogKind(readParam(req.params.kind));
  if (!kind) {
    throw badRequest("kind must be cars or wraps");
  }

  const id = sanitizeCatalogItemId(readParam(req.params.id));
  if (!id) {
    throw badRequest("invalid catalog item id");
  }

  const removed = await removeCatalogItem(kind, id);
  if (!removed) {
    throw notFound("catalog item not found");
  }

  await Promise.all([
    deleteCatalogMedia(kind, removed.fileName),
    deleteGeneratedImagesForCatalogItem(kind, removed.label),
  ]);

  res.json({
    item: {
      id: removed.id,
      label: removed.label,
    },
  });
}

export async function getCatalogMediaController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const kind = parseCatalogKind(readParam(req.params.kind));
  if (!kind) {
    throw badRequest("kind must be cars or wraps");
  }

  const fileName = sanitizeCatalogFileName(readParam(req.params.fileName));
  if (!fileName) {
    throw badRequest("invalid media file name");
  }

  const file = await getCatalogMediaFile(kind, fileName);
  if (!file) {
    throw notFound("file not found");
  }

  sendStreamFile(file, res, next);
}

function readRequiredString(body: unknown, fieldName: string): string {
  const value = readString(body, fieldName).trim();
  if (!value) {
    throw badRequest(`${fieldName} is required`);
  }

  return value;
}

function readString(body: unknown, fieldName: string): string {
  if (!body || typeof body !== "object") {
    return "";
  }

  const value = (body as Record<string, unknown>)[fieldName];
  return typeof value === "string" ? value.trim() : "";
}

function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
