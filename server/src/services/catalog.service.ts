import path from "node:path";
import {
  createUploadUrl,
  deleteObject,
  downloadObject,
  getObjectFile,
  objectExists,
  saveObject,
} from "../fileStorage/fileStorage.js";
import type { StreamableFile } from "../lib/files.js";
import type {
  ApiCatalogItem,
  CatalogKind,
  CatalogResponse,
  CommitCatalogItemInput,
  CreateCatalogUploadInput,
  StoredCatalogItem,
} from "../models/catalog.model.js";

export const CATALOG_OBJECTS: Record<CatalogKind, string> = {
  cars: "catalog/cars.json",
  wraps: "catalog/wraps.json",
};

const IMAGE_EXTENSION_REGEX = /\.(png|jpg|jpeg|webp|avif)$/i;

type StoredCatalog = {
  cars: StoredCatalogItem[];
  wraps: StoredCatalogItem[];
};

export function parseCatalogKind(value: string): CatalogKind | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === "cars") return "cars";
  if (normalized === "wraps") return "wraps";
  return null;
}

export function slugify(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "item";
}

export function extensionFromMime(mimeType: string): string {
  const normalized = mimeType.toLowerCase().trim();
  if (normalized === "image/jpeg" || normalized === "image/jpg") return ".jpg";
  if (normalized === "image/webp") return ".webp";
  if (normalized === "image/avif") return ".avif";
  return ".png";
}

export function extensionFromUpload(fileName: string, mimeType: string): string {
  const fromMime = extensionFromMime(mimeType);
  if (fromMime !== ".png" || mimeType.toLowerCase().includes("png")) {
    return fromMime;
  }

  const fromName = path.extname(fileName).toLowerCase();
  if (IMAGE_EXTENSION_REGEX.test(fromName)) {
    return fromName === ".jpeg" ? ".jpg" : fromName;
  }

  return ".png";
}

export function normalizeMimeType(mimeType: string, extension: string): string {
  const normalized = mimeType.trim().toLowerCase();
  if (isAllowedImageMime(normalized)) {
    return normalized === "image/jpg" ? "image/jpeg" : normalized;
  }

  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".avif") return "image/avif";
  return "image/png";
}

export function isAllowedImageMime(mimeType: string): boolean {
  const normalized = mimeType.trim().toLowerCase();
  return (
    normalized === "image/jpeg" ||
    normalized === "image/jpg" ||
    normalized === "image/png" ||
    normalized === "image/webp" ||
    normalized === "image/avif"
  );
}

export function inferMimeTypeFromFileName(fileName: string): string {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".avif") return "image/avif";
  return "image/png";
}

export function sanitizeCatalogFileName(fileName: string): string | null {
  const normalized = fileName.trim();
  if (!/^[a-z0-9-]+\.(png|jpg|jpeg|webp|avif)$/i.test(normalized)) {
    return null;
  }

  return normalized;
}

export function sanitizeCatalogItemId(id: string): string | null {
  const normalized = id.trim().toLowerCase();
  if (!/^[a-z0-9-]+$/.test(normalized)) {
    return null;
  }

  return normalized;
}

export function toApiCatalogItem(
  kind: CatalogKind,
  item: StoredCatalogItem,
): ApiCatalogItem {
  return {
    id: item.id,
    label: item.label,
    imagePath: `/catalog-media/${kind}/${encodeURIComponent(item.fileName)}`,
  };
}

export async function getCatalog(): Promise<CatalogResponse> {
  const stored = await loadStoredCatalog();
  return {
    cars: stored.cars.map((item) => toApiCatalogItem("cars", item)),
    wraps: stored.wraps.map((item) => toApiCatalogItem("wraps", item)),
  };
}

export async function loadStoredCatalog(): Promise<StoredCatalog> {
  const [cars, wraps] = await Promise.all([
    readCatalogItems("cars"),
    readCatalogItems("wraps"),
  ]);
  return { cars, wraps };
}

export async function createCatalogUpload(
  input: CreateCatalogUploadInput,
): Promise<{ uploadUrl: string; fileName: string; mimeType: string; item: ApiCatalogItem }> {
  const uploadUrl = await createUploadUrl(
    `${input.kind}/${input.fileName}`,
    input.mimeType,
  );

  return {
    uploadUrl,
    fileName: input.fileName,
    mimeType: input.mimeType,
    item: toApiCatalogItem(input.kind, {
      id: input.id,
      label: input.label,
      fileName: input.fileName,
      mimeType: input.mimeType,
    }),
  };
}

export async function assertCatalogMediaUploaded(
  kind: CatalogKind,
  fileName: string,
): Promise<void> {
  const exists = await objectExists(`${kind}/${fileName}`);
  if (!exists) {
    throw new Error("uploaded file not found in bucket");
  }
}

export async function upsertCatalogItem(
  input: CommitCatalogItemInput,
): Promise<{ item: StoredCatalogItem; created: boolean }> {
  const items = await readCatalogItems(input.kind);
  const existing = items.find((item) => item.id === input.id);

  if (existing && existing.fileName !== input.fileName) {
    await deleteObject(`${input.kind}/${existing.fileName}`);
  }

  const nextItem: StoredCatalogItem = {
    id: input.id,
    label: input.label,
    fileName: input.fileName,
    mimeType: input.mimeType,
  };

  const nextItems = [...items.filter((item) => item.id !== nextItem.id), nextItem];
  await writeCatalogItems(input.kind, nextItems);

  return {
    item: nextItem,
    created: !existing,
  };
}

export async function removeCatalogItem(
  kind: CatalogKind,
  id: string,
): Promise<StoredCatalogItem | null> {
  const items = await readCatalogItems(kind);

  let removed: StoredCatalogItem | null = null;
  const nextItems = items.filter((item) => {
    if (item.id === id) {
      removed = item;
      return false;
    }
    return true;
  });

  if (!removed) {
    return null;
  }

  await writeCatalogItems(kind, nextItems);
  return removed;
}

export async function deleteCatalogMedia(
  kind: CatalogKind,
  fileName: string,
): Promise<void> {
  await deleteObject(`${kind}/${fileName}`);
}

export async function getCatalogMediaFile(
  kind: CatalogKind,
  fileName: string,
): Promise<StreamableFile | null> {
  return getObjectFile(
    `${kind}/${fileName}`,
    inferMimeTypeFromFileName(fileName),
  );
}

export async function downloadCatalogMedia(
  kind: CatalogKind,
  fileName: string,
): Promise<Buffer> {
  return downloadObject(`${kind}/${fileName}`);
}

async function readCatalogItems(kind: CatalogKind): Promise<StoredCatalogItem[]> {
  const objectPath = CATALOG_OBJECTS[kind];
  const exists = await objectExists(objectPath);
  if (!exists) {
    return [];
  }

  const bytes = await downloadObject(objectPath);
  const text = bytes.toString("utf8").trim();
  if (!text) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  const items: StoredCatalogItem[] = [];
  for (const entry of parsed) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const raw = entry as Record<string, unknown>;
    const id = typeof raw.id === "string" ? raw.id.trim() : "";
    const label = typeof raw.label === "string" ? raw.label.trim() : "";
    const fileName = typeof raw.fileName === "string" ? raw.fileName.trim() : "";
    const mimeTypeRaw =
      typeof raw.mimeType === "string" ? raw.mimeType.trim() : "";

    if (!id || !label || !sanitizeCatalogFileName(fileName)) {
      continue;
    }

    const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
    items.push({
      id,
      label,
      fileName,
      mimeType: normalizeMimeType(mimeTypeRaw, extension),
    });
  }

  items.sort((a, b) => a.label.localeCompare(b.label));
  return items;
}

async function writeCatalogItems(
  kind: CatalogKind,
  items: StoredCatalogItem[],
): Promise<void> {
  const sorted = [...items].sort((a, b) => a.label.localeCompare(b.label));
  const body = Buffer.from(JSON.stringify(sorted, null, 2), "utf8");

  await saveObject(
    CATALOG_OBJECTS[kind],
    body,
    "application/json",
    "no-cache",
  );
}
