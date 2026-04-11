import { forbidden, notFound } from "../../lib/errors.js";
import type { ShopsRepository } from "./shops.repository.js";

export type ShopsService = ReturnType<typeof createShopsService>;

export function createShopsService(deps: { repository: ShopsRepository }) {
  async function getPublicShop(slug: string) {
    const shop = await deps.repository.getBySlug(slug);
    if (!shop) {
      throw notFound("shop not found");
    }
    if (shop.status !== "active") {
      throw forbidden("shop is inactive");
    }

    return shop;
  }

  return {
    getPublicShop,
  };
}
