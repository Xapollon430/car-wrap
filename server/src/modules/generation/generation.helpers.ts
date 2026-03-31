import path from "node:path";
import type { CatalogKind } from "../catalog/catalog.types.js";
import { slugify } from "../catalog/catalog.helpers.js";

export function buildPrompt(): string {
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

export function combinationPrefix(carName: string, wrapName: string): string {
  return `${slugify(carName)}__${slugify(wrapName)}`;
}

export function sanitizeGeneratedFileName(fileName: string): string | null {
  const normalized = fileName.trim();
  if (!/^[a-z0-9-]+__[a-z0-9-]+\.(png|jpg|jpeg|webp|avif)$/i.test(normalized)) {
    return null;
  }
  return normalized;
}

export function generatedImageUrl(fileName: string): string {
  return `/generated/${fileName}`;
}

export function deletePrefixForCatalogItem(
  kind: CatalogKind,
  label: string,
): { prefix: string; wrapSuffixPattern?: RegExp } {
  const slug = slugify(label);
  if (kind === "cars") {
    return {
      prefix: `generated/${slug}__`,
    };
  }

  return {
    prefix: "generated/",
    wrapSuffixPattern: new RegExp(
      `__${escapeRegExp(slug)}\\.(png|jpg|jpeg|webp|avif)$`,
      "i",
    ),
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getBasename(filePath: string): string {
  return path.posix.basename(filePath);
}
