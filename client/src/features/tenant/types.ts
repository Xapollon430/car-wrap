export const DEFAULT_TENANT_SLUG = 'demo'

export type TenantSlug = string

export type ShopStatus = 'active' | 'suspended'

export type Shop = {
  slug: string
  shopName: string
  logoUrl: string
  accentColor: string
  leadEmail: string
  status: ShopStatus
}
