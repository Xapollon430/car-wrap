import { forbidden, notFound } from "../lib/errors.js";
import type { ShopRecord, ShopStatus } from "../models/shop.model.js";
import { getFirestore } from "../db/firebase.js";

export type ShopLookup = {
  getBySlug: (slug: string) => Promise<ShopRecord | null>;
};

const firestoreLookup: ShopLookup = {
  async getBySlug(slug: string): Promise<ShopRecord | null> {
    const collectionName = (process.env.SHOPS_COLLECTION ?? "shops").trim() || "shops";
    const snapshot = await getFirestore()
      .collection(collectionName)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    const doc = snapshot.docs[0];
    if (!doc) {
      return null;
    }

    return parseShopRecord(doc.data());
  },
};

export async function getPublicShop(
  slug: string,
  lookup: ShopLookup = firestoreLookup,
): Promise<ShopRecord> {
  const shop = await lookup.getBySlug(slug);
  if (!shop) {
    throw notFound("shop not found");
  }
  if (shop.status !== "active") {
    throw forbidden("shop is inactive");
  }

  return shop;
}

function parseShopRecord(value: unknown): ShopRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const slug = readString(record.slug);
  const shopName = readString(record.shopName);
  const logoUrl = readString(record.logoUrl);
  const accentColor = readString(record.accentColor);
  const leadEmail = readString(record.leadEmail);
  const status = readStatus(record.status);

  if (!slug || !shopName || !leadEmail || !status) {
    return null;
  }

  return {
    slug,
    shopName,
    logoUrl,
    accentColor,
    leadEmail,
    status,
  };
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readStatus(value: unknown): ShopStatus | null {
  if (value === "active" || value === "suspended") {
    return value;
  }

  return null;
}
