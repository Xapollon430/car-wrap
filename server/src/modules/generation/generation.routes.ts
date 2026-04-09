import { Router } from "express";
import { badRequest, notFound } from "../../lib/errors.js";
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

  router.post(
    "/api/leads/save-image",
    asyncRoute(async (req, res) => {
      const body =
        req.body && typeof req.body === "object"
          ? (req.body as Record<string, unknown>)
          : {};
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const email = typeof body.email === "string" ? body.email.trim() : "";
      const phone = typeof body.phone === "string" ? body.phone.trim() : "";
      const imageIdentifier =
        typeof body.imageIdentifier === "string"
          ? body.imageIdentifier.trim()
          : "";
      const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";

      if (!name || !email || !phone || !imageIdentifier || !imageUrl) {
        throw badRequest(
          "name, email, phone, imageIdentifier, and imageUrl are required",
        );
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw badRequest("email must be valid");
      }

      console.log(
        `[lead] name="${name}" email="${email}" phone="${phone}" imageIdentifier="${imageIdentifier}" imageUrl="${imageUrl}"`,
      );
      res.status(202).json({ ok: true });
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
