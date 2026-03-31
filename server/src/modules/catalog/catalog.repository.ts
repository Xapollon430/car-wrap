import type { Bucket } from "@google-cloud/storage";
import { downloadBucketObject, getBucketObjectFile } from "../../lib/bucket.js";
import type { StreamableFile } from "../../lib/files.js";
import {
  CATALOG_OBJECTS,
  inferMimeTypeFromFileName,
  normalizeMimeType,
  sanitizeCatalogFileName,
  toApiCatalogItem,
} from "./catalog.helpers.js";
import type {
  CatalogKind,
  CatalogResponse,
  CommitCatalogItemInput,
  StoredCatalogItem,
} from "./catalog.types.js";

type StoredCatalog = {
  cars: StoredCatalogItem[];
  wraps: StoredCatalogItem[];
};

export type CatalogRepository = ReturnType<typeof createCatalogRepository>;

export function createCatalogRepository(bucket: Bucket) {
  async function loadCatalog(): Promise<CatalogResponse> {
    const stored = await loadStoredCatalog();
    return {
      cars: stored.cars.map((item) => toApiCatalogItem("cars", item)),
      wraps: stored.wraps.map((item) => toApiCatalogItem("wraps", item)),
    };
  }

  async function loadStoredCatalog(): Promise<StoredCatalog> {
    const [cars, wraps] = await Promise.all([
      readCatalogItems(bucket, "cars"),
      readCatalogItems(bucket, "wraps"),
    ]);
    return { cars, wraps };
  }

  async function createUploadUrl(
    kind: CatalogKind,
    fileName: string,
    contentType: string,
  ): Promise<string> {
    const [url] = await bucket.file(`${kind}/${fileName}`).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 10 * 60 * 1000,
      contentType,
    });
    return url;
  }

  async function assertUploaded(kind: CatalogKind, fileName: string): Promise<void> {
    const [exists] = await bucket.file(`${kind}/${fileName}`).exists();
    if (!exists) {
      throw new Error("uploaded file not found in bucket");
    }
  }

  async function upsertItem(
    input: CommitCatalogItemInput,
  ): Promise<{ item: StoredCatalogItem; created: boolean }> {
    const storedItems = await readCatalogItems(bucket, input.kind);
    const existing = storedItems.find((item) => item.id === input.id);
    if (existing && existing.fileName !== input.fileName) {
      await bucket.file(`${input.kind}/${existing.fileName}`).delete({
        ignoreNotFound: true,
      });
    }

    const nextItem: StoredCatalogItem = {
      id: input.id,
      label: input.label,
      fileName: input.fileName,
      mimeType: input.mimeType,
    };
    const nextItems = upsertCatalogItem(storedItems, nextItem);
    await writeCatalogItems(bucket, input.kind, nextItems);

    return {
      item: nextItem,
      created: !existing,
    };
  }

  async function removeItem(
    kind: CatalogKind,
    id: string,
  ): Promise<StoredCatalogItem | null> {
    const items = await readCatalogItems(bucket, kind);
    const { removed, nextItems } = removeCatalogItemById(items, id);
    if (!removed) {
      return null;
    }

    await writeCatalogItems(bucket, kind, nextItems);
    return removed;
  }

  async function deleteCatalogMedia(
    kind: CatalogKind,
    fileName: string,
  ): Promise<void> {
    await bucket.file(`${kind}/${fileName}`).delete({
      ignoreNotFound: true,
    });
  }

  async function getCatalogMediaFile(
    kind: CatalogKind,
    fileName: string,
  ): Promise<StreamableFile | null> {
    return getBucketObjectFile(
      bucket,
      `${kind}/${fileName}`,
      inferMimeTypeFromFileName(fileName),
    );
  }

  async function downloadCatalogMedia(
    kind: CatalogKind,
    fileName: string,
  ): Promise<Buffer> {
    return downloadBucketObject(bucket, `${kind}/${fileName}`);
  }

  return {
    loadCatalog,
    loadStoredCatalog,
    createUploadUrl,
    assertUploaded,
    upsertItem,
    removeItem,
    deleteCatalogMedia,
    getCatalogMediaFile,
    downloadCatalogMedia,
  };
}

async function readCatalogItems(
  bucket: Bucket,
  kind: CatalogKind,
): Promise<StoredCatalogItem[]> {
  const file = bucket.file(CATALOG_OBJECTS[kind]);
  const [exists] = await file.exists();
  if (!exists) {
    return [];
  }

  const [bytes] = await file.download();
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

  const result: StoredCatalogItem[] = [];
  for (const entry of parsed) {
    if (!isRecord(entry)) {
      continue;
    }

    const id = typeof entry.id === "string" ? entry.id.trim() : "";
    const label = typeof entry.label === "string" ? entry.label.trim() : "";
    const fileName =
      typeof entry.fileName === "string" ? entry.fileName.trim() : "";
    const mimeTypeRaw =
      typeof entry.mimeType === "string" ? entry.mimeType.trim() : "";

    if (!id || !label || !sanitizeCatalogFileName(fileName)) {
      continue;
    }

    const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
    result.push({
      id,
      label,
      fileName,
      mimeType: normalizeMimeType(mimeTypeRaw, extension),
    });
  }

  result.sort((a, b) => a.label.localeCompare(b.label));
  return result;
}

async function writeCatalogItems(
  bucket: Bucket,
  kind: CatalogKind,
  items: StoredCatalogItem[],
): Promise<void> {
  const sorted = [...items].sort((a, b) => a.label.localeCompare(b.label));
  const body = Buffer.from(JSON.stringify(sorted, null, 2), "utf8");

  await bucket.file(CATALOG_OBJECTS[kind]).save(body, {
    resumable: false,
    contentType: "application/json",
    metadata: {
      cacheControl: "no-cache",
    },
  });
}

function upsertCatalogItem(
  items: StoredCatalogItem[],
  nextItem: StoredCatalogItem,
): StoredCatalogItem[] {
  const withoutExisting = items.filter((item) => item.id !== nextItem.id);
  return [...withoutExisting, nextItem];
}

function removeCatalogItemById(
  items: StoredCatalogItem[],
  id: string,
): { removed: StoredCatalogItem | null; nextItems: StoredCatalogItem[] } {
  let removed: StoredCatalogItem | null = null;
  const nextItems: StoredCatalogItem[] = [];

  for (const item of items) {
    if (item.id === id) {
      removed = item;
      continue;
    }
    nextItems.push(item);
  }

  return { removed, nextItems };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
