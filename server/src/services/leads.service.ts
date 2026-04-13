import type { Mailer } from "../lib/mailer.js";
import { createMailer } from "../lib/mailer.js";
import { getFirestore } from "../db/firebase.js";
import type { LeadRecord } from "../models/lead.model.js";
import type { ShopRecord } from "../models/shop.model.js";

let mailer: Mailer | null = null;

export async function createLead(input: {
  shop: ShopRecord;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  imageIdentifier: string;
  imageUrl: string;
}): Promise<{ id: string; record: LeadRecord }> {
  const record: LeadRecord = {
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
  };

  const doc = await leadsCollection().add(record);
  return {
    id: doc.id,
    record,
  };
}

export async function sendLeadEmails(input: {
  leadId: string;
  shop: ShopRecord;
  record: LeadRecord;
}): Promise<{
  customerDeliveryStatus: LeadRecord["customerDeliveryStatus"];
  shopDeliveryStatus: LeadRecord["shopDeliveryStatus"];
}> {
  let customerDeliveryStatus: LeadRecord["customerDeliveryStatus"] = "failed";
  let shopDeliveryStatus: LeadRecord["shopDeliveryStatus"] = "failed";

  const configuredMailer = getMailer();
  if (configuredMailer.isConfigured) {
    customerDeliveryStatus = (await sendCustomerEmail(input, configuredMailer))
      ? "sent"
      : "failed";
    shopDeliveryStatus = (await sendShopEmail(input, configuredMailer))
      ? "sent"
      : "failed";
  }

  await leadsCollection().doc(input.leadId).set(
    {
      customerDeliveryStatus,
      shopDeliveryStatus,
    },
    { merge: true },
  );

  return {
    customerDeliveryStatus,
    shopDeliveryStatus,
  };
}

function leadsCollection() {
  const collectionName = (process.env.LEADS_COLLECTION ?? "leads").trim() || "leads";
  return getFirestore().collection(collectionName);
}

function getMailer(): Mailer {
  if (!mailer) {
    const smtpHost = (process.env.SMTP_HOST ?? "").trim();
    const smtpUser = (process.env.SMTP_USER ?? "").trim();
    const smtpPass = (process.env.SMTP_PASS ?? "").trim();
    const smtpFromEmail = (process.env.SMTP_FROM_EMAIL ?? "").trim();
    const smtpFromName = (process.env.SMTP_FROM_NAME ?? "WrapPilot").trim() ||
      "WrapPilot";
    const parsedSmtpPort = Number.parseInt(process.env.SMTP_PORT ?? "587", 10);

    mailer = createMailer({
      smtpHost,
      smtpPort: Number.isFinite(parsedSmtpPort) ? parsedSmtpPort : 587,
      smtpSecure: (process.env.SMTP_SECURE ?? "false").trim() === "true",
      smtpUser,
      smtpPass,
      smtpFromEmail,
      smtpFromName,
    });
  }

  return mailer;
}

async function sendCustomerEmail(
  input: {
    shop: ShopRecord;
    record: LeadRecord;
  },
  configuredMailer: Mailer,
): Promise<boolean> {
  try {
    return await configuredMailer.send({
      to: input.record.customerEmail,
      subject: `Your ${input.shop.shopName} wrap preview`,
      text: [
        `Thanks for using ${input.shop.shopName}.`,
        "",
        "Your generated wrap preview is ready:",
        input.record.imageUrl,
        "",
        "The image is also attached to this email.",
        "",
        `Vehicle preview requested for ${input.shop.shopName}.`,
      ].join("\n"),
      html: [
        `<p>Thanks for using <strong>${escapeHtml(input.shop.shopName)}</strong>.</p>`,
        "<p>Your generated wrap preview is ready.</p>",
        `<p><a href="${escapeAttribute(input.record.imageUrl)}">Open your preview</a></p>`,
        "<p>The generated preview is attached to this email as well.</p>",
      ].join(""),
      attachments: buildImageAttachments(input.record),
    });
  } catch {
    return false;
  }
}

async function sendShopEmail(
  input: {
    shop: ShopRecord;
    record: LeadRecord;
  },
  configuredMailer: Mailer,
): Promise<boolean> {
  try {
    return await configuredMailer.send({
      to: input.shop.leadEmail,
      subject: `New WrapPilot lead for ${input.shop.shopName}`,
      text: [
        `New lead for ${input.shop.shopName}`,
        "",
        `Name: ${input.record.customerName}`,
        `Email: ${input.record.customerEmail}`,
        `Phone: ${input.record.customerPhone}`,
        `Image: ${input.record.imageUrl}`,
        "The generated preview is attached to this email.",
      ].join("\n"),
      html: [
        `<p><strong>New lead for ${escapeHtml(input.shop.shopName)}</strong></p>`,
        `<p><strong>Name:</strong> ${escapeHtml(input.record.customerName)}</p>`,
        `<p><strong>Email:</strong> ${escapeHtml(input.record.customerEmail)}</p>`,
        `<p><strong>Phone:</strong> ${escapeHtml(input.record.customerPhone)}</p>`,
        `<p><a href="${escapeAttribute(input.record.imageUrl)}">Open generated preview</a></p>`,
        "<p>The generated preview is attached to this email.</p>",
      ].join(""),
      attachments: buildImageAttachments(input.record),
    });
  } catch {
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

function buildImageAttachments(record: LeadRecord) {
  return [
    {
      filename: record.imageIdentifier,
      path: record.imageUrl,
    },
  ];
}
