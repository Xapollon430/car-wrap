import express from "express";
import path from "node:path";
import type { AppEnv } from "./config/env.js";
import { pathExists } from "./lib/files.js";
import { errorMiddleware } from "./lib/http.js";
import { createCatalogRouter } from "./modules/catalog/catalog.routes.js";
import type { CatalogRepository } from "./modules/catalog/catalog.repository.js";
import type { CatalogService } from "./modules/catalog/catalog.service.js";
import { createGenerationRouter } from "./modules/generation/generation.routes.js";
import type { GeneratedImageRepository } from "./modules/generation/generation.repository.js";
import type { GenerationService } from "./modules/generation/generation.service.js";
import { createShopsRouter } from "./modules/shops/shops.routes.js";
import type { ShopsService } from "./modules/shops/shops.service.js";

export async function createApp(input: {
  env: AppEnv;
  catalogRepository: CatalogRepository;
  catalogService: CatalogService;
  generatedImageRepository: GeneratedImageRepository;
  generationService: GenerationService;
  shopsService: ShopsService;
}) {
  const app = express();
  const clientIndexPath = path.join(input.env.clientDistDir, "index.html");
  const hasClientBuild = await pathExists(clientIndexPath);

  app.use(express.json({ limit: "1mb" }));

  app.get("/healthz", (_req, res) => {
    res.type("text/plain").send("ok");
  });

  app.use(
    createCatalogRouter({
      service: input.catalogService,
      repository: input.catalogRepository,
    }),
  );

  app.use(
    createGenerationRouter({
      service: input.generationService,
      repository: input.generatedImageRepository,
    }),
  );

  app.use(
    createShopsRouter({
      service: input.shopsService,
    }),
  );

  if (hasClientBuild) {
    app.use(express.static(input.env.clientDistDir));

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

  app.use(errorMiddleware);

  return app;
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
