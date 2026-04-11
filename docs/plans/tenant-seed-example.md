# Tenant Seed Example

Use the `shops` collection in Firestore unless `SHOPS_COLLECTION` is set to a different value.

## Active Shop Example

```json
{
  "slug": "demo",
  "shopName": "Demo Wrap Shop",
  "logoUrl": "",
  "accentColor": "#ff7a18",
  "leadEmail": "leads@example.com",
  "status": "active"
}
```

## Suspended Shop Example

```json
{
  "slug": "paused-shop",
  "shopName": "Paused Wrap Shop",
  "logoUrl": "",
  "accentColor": "#ff7a18",
  "leadEmail": "paused@example.com",
  "status": "suspended"
}
```

## Notes

- `slug` must match the URL path used by the tenant, for example `/demo`
- `leadEmail` is the shop inbox that should receive new customer leads
- `status: "active"` allows the tenant to load and accept leads
- `status: "suspended"` blocks the tenant from loading and from submitting new leads
