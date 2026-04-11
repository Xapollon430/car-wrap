import { Storage } from "@google-cloud/storage";
import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { messageFromError } from "./lib/errors.js";
import { createFirestore } from "./lib/firestore.js";
import { createCatalogRepository } from "./modules/catalog/catalog.repository.js";
import { createCatalogService } from "./modules/catalog/catalog.service.js";
import { createGeminiImageClient } from "./modules/generation/gemini.client.js";
import { createGeneratedImageRepository } from "./modules/generation/generation.repository.js";
import { createGenerationService } from "./modules/generation/generation.service.js";
import { createLeadsRepository } from "./modules/leads/leads.repository.js";
import { createLeadsService } from "./modules/leads/leads.service.js";
import { createShopsRepository } from "./modules/shops/shops.repository.js";
import { createShopsService } from "./modules/shops/shops.service.js";

async function main(): Promise<void> {
  const { env } = loadEnv(import.meta.url);
  const storage = new Storage();
  const firestore = createFirestore();
  const bucket = storage.bucket(env.firebaseStorageBucket);

  const catalogRepository = createCatalogRepository(bucket);
  const generatedImageRepository = createGeneratedImageRepository(bucket);
  const shopsRepository = createShopsRepository({
    firestore,
    collectionName: env.shopsCollectionName,
  });
  const leadsRepository = createLeadsRepository({
    firestore,
    collectionName: env.leadsCollectionName,
  });
  const catalogService = createCatalogService({
    catalogRepository,
    generatedImageRepository,
  });
  const shopsService = createShopsService({
    repository: shopsRepository,
  });
  const leadsService = createLeadsService({
    repository: leadsRepository,
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
    leadsService,
    shopsService,
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
