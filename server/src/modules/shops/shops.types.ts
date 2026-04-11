export type ShopStatus = "active" | "suspended";

export type ShopRecord = {
  slug: string;
  shopName: string;
  logoUrl: string;
  accentColor: string;
  leadEmail: string;
  status: ShopStatus;
};
