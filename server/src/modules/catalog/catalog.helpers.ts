import path from "node:path";
import type {
  ApiCatalogItem,
  CatalogKind,
  StoredCatalogItem,
} from "./catalog.types.js";

export const CATALOG_OBJECTS: Record<CatalogKind, string> = {
  cars: "catalog/cars.json",
  wraps: "catalog/wraps.json",
};

const IMAGE_EXTENSION_REGEX = /\.(png|jpg|jpeg|webp|avif)$/i;

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
