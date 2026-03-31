import { HttpError } from "../../lib/errors.js";
import type { CatalogRepository } from "../catalog/catalog.repository.js";
import type { StoredCatalogItem } from "../catalog/catalog.types.js";
import { buildPrompt } from "./generation.helpers.js";
import type { GeminiImageClient } from "./gemini.client.js";
import type { GeneratedImageRepository } from "./generation.repository.js";

export type GenerationService = ReturnType<typeof createGenerationService>;

export function createGenerationService(deps: {
  apiKey: string;
  catalogRepository: CatalogRepository;
  generatedImageRepository: GeneratedImageRepository;
  geminiClient: GeminiImageClient;
}) {
  async function generate(input: {
    carName: string;
    wrapName: string;
  }): Promise<{ imageUrl: string; prompt: string }> {
    const storedCatalog = await deps.catalogRepository.loadStoredCatalog();
    const car = findByLabel(storedCatalog.cars, input.carName);
    if (!car) {
      throw new HttpError(400, "carName not found");
    }

    const wrap = findByLabel(storedCatalog.wraps, input.wrapName);
    if (!wrap) {
      throw new HttpError(400, "wrapName not found");
    }

    const prompt = buildPrompt();
    const cachedImageUrl = await deps.generatedImageRepository.findExisting(
      car.label,
      wrap.label,
    );
    if (cachedImageUrl) {
      return { imageUrl: cachedImageUrl, prompt };
    }

    if (!deps.apiKey || deps.apiKey === "your_api_key_here") {
      throw new HttpError(500, "GEMINI_API_KEY is required");
    }

    const [carBytes, wrapBytes] = await Promise.all([
      deps.catalogRepository.downloadCatalogMedia("cars", car.fileName),
      deps.catalogRepository.downloadCatalogMedia("wraps", wrap.fileName),
    ]);

    const image = await deps.geminiClient.generateImage({
      prompt,
      carBytes,
      carMimeType: car.mimeType,
      wrapBytes,
      wrapMimeType: wrap.mimeType,
    });

    const imageUrl = await deps.generatedImageRepository.write(
      car.label,
      wrap.label,
      image.bytes,
      image.mimeType,
    );

    return { imageUrl, prompt };
  }

  return {
    generate,
  };
}

function findByLabel(
  items: StoredCatalogItem[],
  label: string,
): StoredCatalogItem | undefined {
  const normalized = label.toLowerCase();
  return items.find((item) => item.label.toLowerCase() === normalized);
}
