import { Storage } from "@google-cloud/storage";
import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { messageFromError } from "./lib/errors.js";
import { createCatalogRepository } from "./modules/catalog/catalog.repository.js";
import { createCatalogService } from "./modules/catalog/catalog.service.js";
import { createGeminiImageClient } from "./modules/generation/gemini.client.js";
import { createGeneratedImageRepository } from "./modules/generation/generation.repository.js";
import { createGenerationService } from "./modules/generation/generation.service.js";

async function main(): Promise<void> {
  const { env } = loadEnv(import.meta.url);
  const storage = new Storage();
  const bucket = storage.bucket(env.firebaseStorageBucket);

  const catalogRepository = createCatalogRepository(bucket);
  const generatedImageRepository = createGeneratedImageRepository(bucket);
  const catalogService = createCatalogService({
    catalogRepository,
    generatedImageRepository,
  });
  const generationService = createGenerationService({
    apiKey: env.apiKey,
    catalogRepository,
    generatedImageRepository,
    geminiClient: createGeminiImageClient({
      apiKey: env.apiKey,
      model: env.model,
    }),
  });
  const app = await createApp({
    env,
    catalogRepository,
    catalogService,
    generatedImageRepository,
    generationService,
  });

  app.listen(env.port, () => {
    console.log(
      `server listening on :${env.port} (model=${env.model}, bucket=${env.firebaseStorageBucket})`,
    );
  });
}

void main().catch((error) => {
  console.error(messageFromError(error, "server failed to start"));
  process.exit(1);
});
