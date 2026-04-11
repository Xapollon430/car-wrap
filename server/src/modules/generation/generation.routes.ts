import { Router } from "express";
import { badRequest, notFound } from "../../lib/errors.js";
import { asyncRoute, sendStreamFile } from "../../lib/http.js";
import type { LeadsService } from "../leads/leads.service.js";
import type { ShopsService } from "../shops/shops.service.js";
import type { GeneratedImageRepository } from "./generation.repository.js";
import type { GenerationService } from "./generation.service.js";
import {
  parseGenerateInput,
  parseGeneratedFileName,
} from "./generation.validation.js";

export function createGenerationRouter(deps: {
  service: GenerationService;
  repository: GeneratedImageRepository;
  shopsService: ShopsService;
  leadsService: LeadsService;
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
      const slug = typeof body.slug === "string" ? body.slug.trim() : "";
      const imageIdentifier =
        typeof body.imageIdentifier === "string"
          ? body.imageIdentifier.trim()
          : "";
      const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";

      if (!name || !email || !phone || !slug || !imageIdentifier || !imageUrl) {
        throw badRequest(
          "slug, name, email, phone, imageIdentifier, and imageUrl are required",
        );
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw badRequest("email must be valid");
      }

      const shop = await deps.shopsService.getPublicShop(slug);
      const lead = await deps.leadsService.createLead({
        shop,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        imageIdentifier,
        imageUrl,
      });

      console.log(
        `[lead] id="${lead.id}" shop="${shop.slug}" email="${email}" phone="${phone}" imageIdentifier="${imageIdentifier}" imageUrl="${imageUrl}" leadEmail="${shop.leadEmail}"`,
      );
      res.status(202).json({ ok: true, leadId: lead.id });
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
