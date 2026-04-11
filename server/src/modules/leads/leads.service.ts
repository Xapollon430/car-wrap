import type { ShopRecord } from "../shops/shops.types.js";
import type { LeadsRepository } from "./leads.repository.js";

export type LeadsService = ReturnType<typeof createLeadsService>;

export function createLeadsService(deps: { repository: LeadsRepository }) {
  async function createLead(input: {
    shop: ShopRecord;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    imageIdentifier: string;
    imageUrl: string;
  }): Promise<{ id: string }> {
    return deps.repository.create({
      shopSlug: input.shop.slug,
      shopName: input.shop.shopName,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      imageIdentifier: input.imageIdentifier,
      imageUrl: input.imageUrl,
      customerDeliveryStatus: "pending",
      shopDeliveryStatus: "pending",
      createdAt: new Date().toISOString(),
    });
  }

  return {
    createLead,
  };
}
