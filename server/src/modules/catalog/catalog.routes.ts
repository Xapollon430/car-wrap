import { Router } from "express";
import { notFound } from "../../lib/errors.js";
import { asyncRoute, sendStreamFile } from "../../lib/http.js";
import type { CatalogRepository } from "./catalog.repository.js";
import type { CatalogService } from "./catalog.service.js";
import {
  parseCatalogMediaInput,
  parseCommitCatalogItemInput,
  parseCreateCatalogUploadInput,
  parseDeleteCatalogItemInput,
} from "./catalog.validation.js";

export function createCatalogRouter(deps: {
  service: CatalogService;
  repository: CatalogRepository;
}): Router {
  const router = Router();

  router.get(
    "/api/catalog",
    asyncRoute(async (_req, res) => {
      res.json(await deps.service.getCatalog());
    }),
  );

  router.post(
    "/api/catalog/:kind/upload-url",
    asyncRoute(async (req, res) => {
      const input = parseCreateCatalogUploadInput(
        readParam(req.params.kind),
        req.body,
      );
      res.json(await deps.service.createUpload(input));
    }),
  );

  router.post(
    "/api/catalog/:kind/commit",
    asyncRoute(async (req, res) => {
      const input = parseCommitCatalogItemInput(readParam(req.params.kind), req.body);
      const result = await deps.service.commit(input);
      res.status(result.created ? 201 : 200).json({
        item: result.item,
      });
    }),
  );

  router.delete(
    "/api/catalog/:kind/:id",
    asyncRoute(async (req, res) => {
      const input = parseDeleteCatalogItemInput(
        readParam(req.params.kind),
        readParam(req.params.id),
      );
      res.json(await deps.service.remove(input));
    }),
  );

  router.get(
    "/catalog-media/:kind/:fileName",
    asyncRoute(async (req, res, next) => {
      const input = parseCatalogMediaInput(
        readParam(req.params.kind),
        readParam(req.params.fileName),
      );
      const file = await deps.repository.getCatalogMediaFile(
        input.kind,
        input.fileName,
      );
      if (!file) {
        throw notFound("file not found");
      }
      sendStreamFile(file, res, next);
    }),
  );

  return router;
}

function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}
