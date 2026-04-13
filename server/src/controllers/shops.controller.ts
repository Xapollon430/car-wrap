import type { Request, Response } from "express";
import { getPublicShop } from "../services/shops.service.js";

export async function getPublicShopController(req: Request, res: Response) {
  const slug = typeof req.params.slug === "string" ? req.params.slug.trim() : "";
  res.json(await getPublicShop(slug));
}
