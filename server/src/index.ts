import { Storage, type Bucket } from "@google-cloud/storage";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateGeminiImage as generateGeminiImageFromSdk } from "./gemini.js";

type CatalogKind = "cars" | "wraps";

type StoredCatalogItem = {
  id: string;
  label: string;
  fileName: string;
  mimeType: string;
};

type ApiCatalogItem = {
  id: string;
  label: string;
  imagePath: string;
};

type CatalogResponse = {
  cars: ApiCatalogItem[];
  wraps: ApiCatalogItem[];
};

type GenerateBody = {
  carName?: string;
  wrapName?: string;
};

type UploadUrlBody = {
  name?: string;
  fileName?: string;
  contentType?: string;
};

type CommitCatalogBody = {
  name?: string;
  fileName?: string;
  mimeType?: string;
};

const CATALOG_OBJECTS: Record<CatalogKind, string> = {
  cars: "catalog/cars.json",
  wraps: "catalog/wraps.json",
};

const IMAGE_EXTENSION_REGEX = /\.(png|jpg|jpeg|webp|avif)$/i;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(serverRoot, "..");

dotenv.config({ path: path.join(serverRoot, ".env"), quiet: true });
dotenv.config({ path: path.join(repoRoot, ".env"), quiet: true });

const parsedPort = Number.parseInt(process.env.PORT ?? "8080", 10);
const port = Number.isFinite(parsedPort) ? parsedPort : 8080;
const model = (process.env.GEMINI_MODEL ?? "gemini-2.5-flash-image").trim();
const apiKey = (process.env.GEMINI_API_KEY ?? "").trim();
const firebaseStorageBucket = (process.env.FIREBASE_STORAGE_BUCKET ?? "").trim();
const clientDistDir = resolveFromServer(
  process.env.CLIENT_DIST_DIR ?? "../client/dist",
);

async function main(): Promise<void> {
  if (!firebaseStorageBucket) {
    throw new Error("FIREBASE_STORAGE_BUCKET is required");
  }

  const storage = new Storage();
  const bucket = storage.bucket(firebaseStorageBucket);
  const clientIndexPath = path.join(clientDistDir, "index.html");
  const hasClientBuild = await pathExists(clientIndexPath);

  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/healthz", (_req, res) => {
    res.type("text/plain").send("ok");
  });

  app.get("/api/catalog", async (_req, res) => {
    try {
      const catalog = await loadCatalog(bucket);
      return res.json(catalog);
    } catch (error) {
      return res
        .status(500)
        .json({ error: messageFromError(error, "failed to load catalog") });
    }
  });

  app.post(
    "/api/catalog/:kind/upload-url",
    async (
      req: Request<{ kind: string }, unknown, UploadUrlBody>,
      res: Response,
    ) => {
      try {
        const kind = parseCatalogKind(req.params.kind);
        if (!kind) {
          return res.status(400).json({ error: "kind must be cars or wraps" });
        }

        const label = (req.body?.name ?? "").trim();
        if (!label) {
          return res.status(400).json({ error: "name is required" });
        }

        const rawFileName = (req.body?.fileName ?? "").trim();
        if (!rawFileName) {
          return res.status(400).json({ error: "fileName is required" });
        }

        const providedContentType = (req.body?.contentType ?? "").trim();
        if (!providedContentType) {
          return res.status(400).json({ error: "contentType is required" });
        }

        const id = slugify(label);
        const extension = extensionFromUpload(rawFileName, providedContentType);
        const mimeType = normalizeMimeType(providedContentType, extension);
        if (!isAllowedImageMime(mimeType)) {
          return res.status(400).json({ error: "image must be png/jpg/webp/avif" });
        }

        const fileName = `${id}${extension}`;
        const objectPath = `${kind}/${fileName}`;
        const uploadUrl = await createSignedUploadUrl(bucket, objectPath, mimeType);

        return res.json({
          uploadUrl,
          fileName,
          mimeType,
          item: {
            id,
            label,
            imagePath: `/catalog-media/${kind}/${encodeURIComponent(fileName)}`,
          },
        });
      } catch (error) {
        return res
          .status(500)
          .json({ error: messageFromError(error, "failed to create upload url") });
      }
    },
  );

  app.post(
    "/api/catalog/:kind/commit",
    async (
      req: Request<{ kind: string }, unknown, CommitCatalogBody>,
      res: Response,
    ) => {
      try {
        const kind = parseCatalogKind(req.params.kind);
        if (!kind) {
          return res.status(400).json({ error: "kind must be cars or wraps" });
        }

        const label = (req.body?.name ?? "").trim();
        if (!label) {
          return res.status(400).json({ error: "name is required" });
        }

        const fileName = sanitizeCatalogFileName(req.body?.fileName ?? "");
        if (!fileName) {
          return res.status(400).json({ error: "valid fileName is required" });
        }

        const id = slugify(label);
        if (path.parse(fileName).name !== id) {
          return res.status(400).json({ error: "fileName does not match name slug" });
        }

        const extension = path.extname(fileName).toLowerCase();
        const mimeType = normalizeMimeType(req.body?.mimeType ?? "", extension);
        const objectPath = `${kind}/${fileName}`;
        const [uploadedExists] = await bucket.file(objectPath).exists();
        if (!uploadedExists) {
          return res.status(400).json({ error: "uploaded file not found in bucket" });
        }

        const storedItems = await readCatalogItems(bucket, kind);
        const existing = storedItems.find((item) => item.id === id);
        if (existing && existing.fileName !== fileName) {
          await bucket.file(`${kind}/${existing.fileName}`).delete({
            ignoreNotFound: true,
          });
        }

        const nextItem: StoredCatalogItem = {
          id,
          label,
          fileName,
          mimeType,
        };
        const nextItems = upsertCatalogItem(storedItems, nextItem);
        await writeCatalogItems(bucket, kind, nextItems);

        return res.status(existing ? 200 : 201).json({
          item: toApiCatalogItem(kind, nextItem),
        });
      } catch (error) {
        return res
          .status(500)
          .json({ error: messageFromError(error, "failed to upload catalog image") });
      }
    },
  );

  app.delete(
    "/api/catalog/:kind/:id",
    async (
      req: Request<{ kind: string; id: string }>,
      res: Response,
    ) => {
      try {
        const kind = parseCatalogKind(req.params.kind);
        if (!kind) {
          return res.status(400).json({ error: "kind must be cars or wraps" });
        }

        const id = sanitizeCatalogItemId(req.params.id);
        if (!id) {
          return res.status(400).json({ error: "invalid catalog item id" });
        }

        const items = await readCatalogItems(bucket, kind);
        const { removed, nextItems } = removeCatalogItemById(items, id);
        if (!removed) {
          return res.status(404).json({ error: "catalog item not found" });
        }

        await Promise.all([
          bucket.file(`${kind}/${removed.fileName}`).delete({
            ignoreNotFound: true,
          }),
          writeCatalogItems(bucket, kind, nextItems),
          deleteGeneratedForCatalogItem(bucket, kind, removed.label),
        ]);

        return res.json({
          item: {
            id: removed.id,
            label: removed.label,
          },
        });
      } catch (error) {
        return res
          .status(500)
          .json({ error: messageFromError(error, "failed to delete catalog item") });
      }
    },
  );

  app.get(
    "/catalog-media/:kind/:fileName",
    async (req: Request<{ kind: string; fileName: string }>, res: Response) => {
      try {
        const kind = parseCatalogKind(req.params.kind);
        if (!kind) {
          return res.status(400).json({ error: "invalid media kind" });
        }

        const fileName = sanitizeCatalogFileName(req.params.fileName);
        if (!fileName) {
          return res.status(400).json({ error: "invalid media file name" });
        }

        return await streamBucketObject(
          bucket,
          `${kind}/${fileName}`,
          inferMimeTypeFromFileName(fileName),
          res,
        );
      } catch (error) {
        return res
          .status(500)
          .json({ error: messageFromError(error, "failed to read catalog image") });
      }
    },
  );

  app.get(
    "/generated/:fileName",
    async (req: Request<{ fileName: string }>, res: Response) => {
      try {
        const fileName = sanitizeGeneratedFileName(req.params.fileName);
        if (!fileName) {
          return res.status(400).json({ error: "invalid generated image name" });
        }

        return await streamBucketObject(
          bucket,
          `generated/${fileName}`,
          inferMimeTypeFromFileName(fileName),
          res,
        );
      } catch (error) {
        return res
          .status(500)
          .json({ error: messageFromError(error, "failed to read generated image") });
      }
    },
  );

  app.post(
    "/api/generate",
    async (req: Request<unknown, unknown, GenerateBody>, res: Response) => {
      try {
        const carName = (req.body?.carName ?? "").trim();
        const wrapName = (req.body?.wrapName ?? "").trim();
        if (!carName || !wrapName) {
          return res
            .status(400)
            .json({ error: "carName and wrapName are required" });
        }

        const storedCatalog = await loadStoredCatalog(bucket);
        const car = findByLabel(storedCatalog.cars, carName);
        if (!car) {
          return res.status(400).json({ error: "carName not found" });
        }

        const wrap = findByLabel(storedCatalog.wraps, wrapName);
        if (!wrap) {
          return res.status(400).json({ error: "wrapName not found" });
        }

        const prompt = buildPrompt();
        const cachedImageUrl = await findExistingGeneratedImage(
          bucket,
          car.label,
          wrap.label,
        );
        if (cachedImageUrl) {
          return res.json({ imageUrl: cachedImageUrl, prompt });
        }

        if (!apiKey || apiKey === "your_api_key_here") {
          return res.status(500).json({ error: "GEMINI_API_KEY is required" });
        }

        const [carBuffer, wrapBuffer] = await Promise.all([
          downloadBucketObject(bucket, `cars/${car.fileName}`),
          downloadBucketObject(bucket, `wraps/${wrap.fileName}`),
        ]);

        const image = await generateGeminiImage({
          apiKey,
          model,
          prompt,
          carBytes: carBuffer,
          carMimeType: car.mimeType,
          wrapBytes: wrapBuffer,
          wrapMimeType: wrap.mimeType,
        });

        const imageUrl = await writeGeneratedImage(
          bucket,
          car.label,
          wrap.label,
          image.bytes,
          image.mimeType,
        );

        return res.json({ imageUrl, prompt });
      } catch (error) {
        return res
          .status(500)
          .json({ error: messageFromError(error, "generation failed") });
      }
    },
  );

  if (hasClientBuild) {
    app.use(express.static(clientDistDir));

    app.get(/.*/, (req, res, next) => {
      if (isServerRoute(req.path)) {
        next();
        return;
      }

      res.sendFile(clientIndexPath);
    });
  } else {
    console.warn(
      `client build not found at ${clientIndexPath}; API routes still available`,
    );
  }

  app.listen(port, () => {
    console.log(
      `server listening on :${port} (model=${model}, bucket=${firebaseStorageBucket})`,
    );
  });
}

function resolveFromServer(value: string): string {
  if (path.isAbsolute(value)) {
    return value;
  }
  return path.resolve(serverRoot, value);
}

async function loadCatalog(bucket: Bucket): Promise<CatalogResponse> {
  const stored = await loadStoredCatalog(bucket);
  return {
    cars: stored.cars.map((item) => toApiCatalogItem("cars", item)),
    wraps: stored.wraps.map((item) => toApiCatalogItem("wraps", item)),
  };
}

async function loadStoredCatalog(bucket: Bucket): Promise<{
  cars: StoredCatalogItem[];
  wraps: StoredCatalogItem[];
}> {
  const [cars, wraps] = await Promise.all([
    readCatalogItems(bucket, "cars"),
    readCatalogItems(bucket, "wraps"),
  ]);
  return { cars, wraps };
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

    const extension = path.extname(fileName).toLowerCase();
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

function toApiCatalogItem(kind: CatalogKind, item: StoredCatalogItem): ApiCatalogItem {
  return {
    id: item.id,
    label: item.label,
    imagePath: `/catalog-media/${kind}/${encodeURIComponent(item.fileName)}`,
  };
}

async function streamBucketObject(
  bucket: Bucket,
  objectPath: string,
  fallbackMimeType: string,
  res: Response,
): Promise<Response | void> {
  const file = bucket.file(objectPath);
  const [exists] = await file.exists();
  if (!exists) {
    return res.status(404).json({ error: "file not found" });
  }

  const [metadata] = await file.getMetadata();
  res.type(metadata.contentType || fallbackMimeType);
  res.setHeader("Cache-Control", metadata.cacheControl ?? "public, max-age=86400");

  const stream = file.createReadStream();
  stream.on("error", (error) => {
    if (!res.headersSent) {
      res.status(500).json({ error: messageFromError(error, "stream failed") });
      return;
    }
    res.destroy(error as Error);
  });
  stream.pipe(res);
}

async function createSignedUploadUrl(
  bucket: Bucket,
  objectPath: string,
  contentType: string,
): Promise<string> {
  const [url] = await bucket.file(objectPath).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 10 * 60 * 1000,
    contentType,
  });
  return url;
}

async function downloadBucketObject(bucket: Bucket, objectPath: string): Promise<Buffer> {
  const file = bucket.file(objectPath);
  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`missing source image: ${objectPath}`);
  }

  const [bytes] = await file.download();
  return bytes;
}

function findByLabel(
  items: StoredCatalogItem[],
  label: string,
): StoredCatalogItem | undefined {
  const normalized = label.toLowerCase();
  return items.find((item) => item.label.toLowerCase() === normalized);
}

function buildPrompt(): string {
  return [
    "Apply the color and texture from the reference wrap image onto the car in the main photo. The result must look photorealistic and professionally wrapped.",
    "",
    "Preserve the exact shape, proportions, body lines, reflections, lighting, shadows, and details of the original car. Do not alter the car's structure, wheels, windows, badges, trim, or background.",
    "",
    "Ensure the wrap follows natural panel contours, edges, and seams of the vehicle. Maintain realistic highlights, reflections, and surface curvature so the wrap integrates naturally with the lighting in the scene.",
    "",
    "Match the finish accurately (e.g., gloss, satin, matte, metallic) based on the reference wrap image. Keep reflections consistent with the environment.",
    "",
    "Do not blur, distort, or repaint the car-only replace the paint color with the wrap. Keep all fine details sharp and intact.",
    "",
    "Output should look like a real professionally installed car wrap, indistinguishable from an actual photograph.",
  ].join("\n");
}

async function generateGeminiImage(input: {
  apiKey: string;
  model: string;
  prompt: string;
  carBytes: Buffer;
  carMimeType: string;
  wrapBytes: Buffer;
  wrapMimeType: string;
}): Promise<{ bytes: Buffer; mimeType: string }> {
  return generateGeminiImageFromSdk(input);
}

async function writeGeneratedImage(
  bucket: Bucket,
  carName: string,
  wrapName: string,
  bytes: Buffer,
  mimeType: string,
): Promise<string> {
  const prefix = combinationPrefix(carName, wrapName);
  const extension = extensionFromMime(mimeType);
  const fileName = `${prefix}${extension}`;
  const objectPath = `generated/${fileName}`;

  const [existingFiles] = await bucket.getFiles({
    prefix: `generated/${prefix}.`,
  });
  for (const existingFile of existingFiles) {
    const existingFileName = path.posix.basename(existingFile.name);
    if (existingFileName !== fileName) {
      await existingFile.delete({ ignoreNotFound: true });
    }
  }

  await bucket.file(objectPath).save(bytes, {
    resumable: false,
    contentType: mimeType,
    metadata: {
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  return `/generated/${fileName}`;
}

async function findExistingGeneratedImage(
  bucket: Bucket,
  carName: string,
  wrapName: string,
): Promise<string | null> {
  const prefix = combinationPrefix(carName, wrapName);
  const [files] = await bucket.getFiles({
    prefix: `generated/${prefix}.`,
    maxResults: 1,
  });

  const match = files[0];
  if (!match) {
    return null;
  }

  return `/generated/${path.posix.basename(match.name)}`;
}

async function deleteGeneratedForCatalogItem(
  bucket: Bucket,
  kind: CatalogKind,
  label: string,
): Promise<void> {
  const slug = slugify(label);

  if (kind === "cars") {
    const [files] = await bucket.getFiles({
      prefix: `generated/${slug}__`,
    });
    await Promise.all(
      files.map((file) =>
        file.delete({
          ignoreNotFound: true,
        }),
      ),
    );
    return;
  }

  const [files] = await bucket.getFiles({
    prefix: "generated/",
  });
  const wrapSuffixPattern = new RegExp(
    `__${escapeRegExp(slug)}\\.(png|jpg|jpeg|webp|avif)$`,
    "i",
  );
  const matches = files.filter((file) =>
    wrapSuffixPattern.test(path.posix.basename(file.name)),
  );

  await Promise.all(
    matches.map((file) =>
      file.delete({
        ignoreNotFound: true,
      }),
    ),
  );
}

function parseCatalogKind(value: string): CatalogKind | null {
  const normalized = value.trim().toLowerCase();
  if (normalized === "cars") return "cars";
  if (normalized === "wraps") return "wraps";
  return null;
}

function extensionFromUpload(fileName: string, mimeType: string): string {
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

function normalizeMimeType(mimeType: string, extension: string): string {
  const normalized = mimeType.trim().toLowerCase();
  if (isAllowedImageMime(normalized)) {
    return normalized === "image/jpg" ? "image/jpeg" : normalized;
  }

  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".avif") return "image/avif";
  return "image/png";
}

function isAllowedImageMime(mimeType: string): boolean {
  const normalized = mimeType.trim().toLowerCase();
  return (
    normalized === "image/jpeg" ||
    normalized === "image/jpg" ||
    normalized === "image/png" ||
    normalized === "image/webp" ||
    normalized === "image/avif"
  );
}

function combinationPrefix(carName: string, wrapName: string): string {
  return `${slugify(carName)}__${slugify(wrapName)}`;
}

function slugify(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "item";
}

function extensionFromMime(mimeType: string): string {
  const normalized = mimeType.toLowerCase().trim();
  if (normalized === "image/jpeg" || normalized === "image/jpg") return ".jpg";
  if (normalized === "image/webp") return ".webp";
  if (normalized === "image/avif") return ".avif";
  return ".png";
}

function inferMimeTypeFromFileName(fileName: string): string {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  if (extension === ".avif") return "image/avif";
  return "image/png";
}

function sanitizeCatalogFileName(fileName: string): string | null {
  const normalized = fileName.trim();
  if (!/^[a-z0-9-]+\.(png|jpg|jpeg|webp|avif)$/i.test(normalized)) {
    return null;
  }
  return normalized;
}

function sanitizeCatalogItemId(id: string): string | null {
  const normalized = id.trim().toLowerCase();
  if (!/^[a-z0-9-]+$/.test(normalized)) {
    return null;
  }
  return normalized;
}

function sanitizeGeneratedFileName(fileName: string): string | null {
  const normalized = fileName.trim();
  if (!/^[a-z0-9-]+__[a-z0-9-]+\.(png|jpg|jpeg|webp|avif)$/i.test(normalized)) {
    return null;
  }
  return normalized;
}

function isServerRoute(pathname: string): boolean {
  return (
    pathname === "/healthz" ||
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname === "/generated" ||
    pathname.startsWith("/generated/") ||
    pathname === "/catalog-media" ||
    pathname.startsWith("/catalog-media/")
  );
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function messageFromError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

void main().catch((error) => {
  console.error(messageFromError(error, "server failed to start"));
  process.exit(1);
});
