import type { Firestore } from "@google-cloud/firestore";
import type { ShopRecord, ShopStatus } from "./shops.types.js";

export type ShopsRepository = ReturnType<typeof createShopsRepository>;

export function createShopsRepository(input: {
  firestore: Firestore;
  collectionName: string;
}) {
  async function getBySlug(slug: string): Promise<ShopRecord | null> {
    const snapshot = await input.firestore
      .collection(input.collectionName)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    const doc = snapshot.docs[0];
    if (!doc) {
      return null;
    }

    return parseShopRecord(doc.data());
  }

  return {
    getBySlug,
  };
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
