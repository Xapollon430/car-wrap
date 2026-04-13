import type { Request, Response } from "express";
import { badRequest } from "../lib/errors.js";
import { createLead, sendLeadEmails } from "../services/leads.service.js";
import { getPublicShop } from "../services/shops.service.js";

export async function saveLeadImageController(req: Request, res: Response) {
  const name = readString(req.body, "name");
  const email = readString(req.body, "email");
  const phone = readString(req.body, "phone");
  const slug = readString(req.body, "slug");
  const imageIdentifier = readString(req.body, "imageIdentifier");
  const imageUrl = readString(req.body, "imageUrl");

  if (!name || !email || !phone || !slug || !imageIdentifier || !imageUrl) {
    throw badRequest(
      "slug, name, email, phone, imageIdentifier, and imageUrl are required",
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw badRequest("email must be valid");
  }

  const publicImageUrl = resolvePublicImageUrl(
    imageUrl,
    (process.env.PUBLIC_APP_URL ?? "").trim(),
    req,
  );

  const shop = await getPublicShop(slug);
  const lead = await createLead({
    shop,
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    imageIdentifier,
    imageUrl: publicImageUrl,
  });

  const delivery = await sendLeadEmails({
    leadId: lead.id,
    shop,
    record: lead.record,
  });

  const ok =
    delivery.customerDeliveryStatus === "sent" &&
    delivery.shopDeliveryStatus === "sent";

  console.log(
    `[lead] id="${lead.id}" shop="${shop.slug}" email="${email}" phone="${phone}" imageIdentifier="${imageIdentifier}" imageUrl="${publicImageUrl}" leadEmail="${shop.leadEmail}" customerDeliveryStatus="${delivery.customerDeliveryStatus}" shopDeliveryStatus="${delivery.shopDeliveryStatus}"`,
  );

  res.status(202).json({
    ok,
    leadId: lead.id,
    customerDeliveryStatus: delivery.customerDeliveryStatus,
    shopDeliveryStatus: delivery.shopDeliveryStatus,
  });
}

function resolvePublicImageUrl(
  value: string,
  publicAppUrl: string,
  req: { protocol: string; get(name: string): string | undefined },
): string {
  const fallbackBase = `${req.protocol}://${req.get("host") ?? "localhost:8080"}`;
  const normalizedBase = normalizeBaseUrl(publicAppUrl || fallbackBase);
  const parsed = new URL(value, normalizedBase);
  return new URL(`${parsed.pathname}${parsed.search}`, normalizedBase).toString();
}

function normalizeBaseUrl(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function readString(body: unknown, fieldName: string): string {
  if (!body || typeof body !== "object") {
    return "";
  }

  const value = (body as Record<string, unknown>)[fieldName];
  return typeof value === "string" ? value.trim() : "";
}
