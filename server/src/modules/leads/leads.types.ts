export type DeliveryStatus = "pending" | "sent" | "failed";

export type LeadRecord = {
  shopSlug: string;
  shopName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  imageIdentifier: string;
  imageUrl: string;
  customerDeliveryStatus: DeliveryStatus;
  shopDeliveryStatus: DeliveryStatus;
  createdAt: string;
};
