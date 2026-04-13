import { HttpError } from "../lib/errors.js";
import type { StoredCatalogItem } from "../models/catalog.model.js";
import {
  downloadCatalogMedia,
  loadStoredCatalog,
} from "./catalog.service.js";
import { generateGeminiImage } from "./gemini.client.js";
import {
  findGeneratedImage,
  writeGeneratedImage,
} from "./generated-image.service.js";

export async function generateWrapPreview(input: {
  carName: string;
  wrapName: string;
}): Promise<{ imageUrl: string; prompt: string }> {
  const storedCatalog = await loadStoredCatalog();
  const car = findByLabel(storedCatalog.cars, input.carName);
  if (!car) {
    throw new HttpError(400, "carName not found");
  }

  const wrap = findByLabel(storedCatalog.wraps, input.wrapName);
  if (!wrap) {
    throw new HttpError(400, "wrapName not found");
  }

  const prompt = buildPrompt();
  const cachedImageUrl = await findGeneratedImage(car.label, wrap.label);
  if (cachedImageUrl) {
    return { imageUrl: cachedImageUrl, prompt };
  }

  const apiKey = (process.env.GEMINI_API_KEY ?? "").trim();
  if (!apiKey || apiKey === "your_api_key_here") {
    throw new HttpError(500, "GEMINI_API_KEY is required");
  }

  const model =
    (process.env.GEMINI_MODEL ?? "gemini-2.5-flash-image").trim() ||
    "gemini-2.5-flash-image";

  const [carBytes, wrapBytes] = await Promise.all([
    downloadCatalogMedia("cars", car.fileName),
    downloadCatalogMedia("wraps", wrap.fileName),
  ]);

  const image = await generateGeminiImage({
    apiKey,
    model,
    prompt,
    carBytes,
    carMimeType: car.mimeType,
    wrapBytes,
    wrapMimeType: wrap.mimeType,
  });

  const imageUrl = await writeGeneratedImage({
    carName: car.label,
    wrapName: wrap.label,
    bytes: image.bytes,
    mimeType: image.mimeType,
  });

  return { imageUrl, prompt };
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
