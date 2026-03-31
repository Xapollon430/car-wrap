import path from "node:path";
import { badRequest } from "../../lib/errors.js";
import {
  extensionFromUpload,
  isAllowedImageMime,
  normalizeMimeType,
  parseCatalogKind,
  sanitizeCatalogFileName,
  sanitizeCatalogItemId,
  slugify,
} from "./catalog.helpers.js";
import type {
  CatalogKind,
  CommitCatalogItemInput,
  CreateCatalogUploadInput,
} from "./catalog.types.js";

export function parseCreateCatalogUploadInput(
  kindValue: string,
  body: unknown,
): CreateCatalogUploadInput {
  const kind = requireCatalogKind(kindValue);
  const label = readRequiredString(body, "name");
  const rawFileName = readRequiredString(body, "fileName");
  const providedContentType = readRequiredString(body, "contentType");
  const id = slugify(label);
  const extension = extensionFromUpload(rawFileName, providedContentType);
  const mimeType = normalizeMimeType(providedContentType, extension);
  if (!isAllowedImageMime(mimeType)) {
    throw badRequest("image must be png/jpg/webp/avif");
  }

  return {
    kind,
    id,
    label,
    fileName: `${id}${extension}`,
    mimeType,
  };
}

export function parseCommitCatalogItemInput(
  kindValue: string,
  body: unknown,
): CommitCatalogItemInput {
  const kind = requireCatalogKind(kindValue);
  const label = readRequiredString(body, "name");
  const fileName = sanitizeCatalogFileName(readRequiredString(body, "fileName"));
  if (!fileName) {
    throw badRequest("valid fileName is required");
  }

  const id = slugify(label);
  if (path.parse(fileName).name !== id) {
    throw badRequest("fileName does not match name slug");
  }

  const extension = path.extname(fileName).toLowerCase();
  const mimeType = normalizeMimeType(readOptionalString(body, "mimeType"), extension);

  return {
    kind,
    id,
    label,
    fileName,
    mimeType,
  };
}

export function parseDeleteCatalogItemInput(
  kindValue: string,
  idValue: string,
): { kind: CatalogKind; id: string } {
  const kind = requireCatalogKind(kindValue);
  const id = sanitizeCatalogItemId(idValue);
  if (!id) {
    throw badRequest("invalid catalog item id");
  }
  return { kind, id };
}

export function parseCatalogMediaInput(
  kindValue: string,
  fileNameValue: string,
): { kind: CatalogKind; fileName: string } {
  const kind = requireCatalogKind(kindValue);
  const fileName = sanitizeCatalogFileName(fileNameValue);
  if (!fileName) {
    throw badRequest("invalid media file name");
  }
  return { kind, fileName };
}

function requireCatalogKind(value: string): CatalogKind {
  const kind = parseCatalogKind(value);
  if (!kind) {
    throw badRequest("kind must be cars or wraps");
  }
  return kind;
}

function readRequiredString(body: unknown, fieldName: string): string {
  const value = readOptionalString(body, fieldName).trim();
  if (!value) {
    throw badRequest(`${fieldName} is required`);
  }
  return value;
}

function readOptionalString(body: unknown, fieldName: string): string {
  if (!isRecord(body)) {
    return "";
  }
  const value = body[fieldName];
  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
