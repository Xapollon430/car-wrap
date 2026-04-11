import { Router } from "express";
import { asyncRoute } from "../../lib/http.js";
import type { ShopsService } from "./shops.service.js";

export function createShopsRouter(deps: { service: ShopsService }): Router {
  const router = Router();

  router.get(
    "/api/shops/:slug",
    asyncRoute(async (req, res) => {
      const shop = await deps.service.getPublicShop(readParam(req.params.slug));
      res.json(shop);
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
