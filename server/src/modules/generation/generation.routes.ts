import { Router } from "express";
import { notFound } from "../../lib/errors.js";
import { asyncRoute, sendStreamFile } from "../../lib/http.js";
import type { GeneratedImageRepository } from "./generation.repository.js";
import type { GenerationService } from "./generation.service.js";
import {
  parseGenerateInput,
  parseGeneratedFileName,
} from "./generation.validation.js";

export function createGenerationRouter(deps: {
  service: GenerationService;
  repository: GeneratedImageRepository;
}): Router {
  const router = Router();

  router.post(
    "/api/generate",
    asyncRoute(async (req, res) => {
      const input = parseGenerateInput(req.body);
      res.json(await deps.service.generate(input));
    }),
  );

  router.get(
    "/generated/:fileName",
    asyncRoute(async (req, res, next) => {
      const fileName = parseGeneratedFileName(readParam(req.params.fileName));
      const file = await deps.repository.getGeneratedFile(fileName);
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
