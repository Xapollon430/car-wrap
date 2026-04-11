# WrapPilot Multi-Tenant Design

Date: 2026-04-10
Status: Approved

## Goal

Reposition the current single-shop car wrap visualizer into `WrapPilot`, a generic multi-tenant product that can serve multiple wrap shops from one deployment while keeping customer delivery centralized and shop lead routing tenant-aware.

## Confirmed Product Decisions

- The project should be renamed to `WrapPilot` throughout the codebase.
- Existing Lux Garage / LuxDrive branding should be removed from the landing page, visualizer, and browser metadata.
- The base product should stay generic rather than pretending to be a single shop.
- The first release should use a single shared deployment with tenant resolution by URL path.
- Each shop should be represented by a Firestore document.
- Light branding only in v1:
  - `slug`
  - `shopName`
  - `logoUrl`
  - `accentColor`
  - `leadEmail`
  - `status`
- Only internal admins manage tenants in v1.
- Customer delivery should be centralized through WrapPilot.
- Shop lead delivery should be routed to that shop's `leadEmail`.
- CRM integrations are explicitly deferred; email-first delivery is the launch path.

## Approaches Considered

1. Single app + tenant slug + per-shop config registry (recommended)
   - one deployment
   - tenant selected by URL path such as `/:slug`
   - Firestore stores branding and routing config
   - easiest revoke and attribution model
2. Single app + custom domain mapping
   - better white-label feel
   - more DNS and ops work
   - can be layered in later without changing the tenant model
3. Separate deploy per shop
   - strongest isolation
   - poor operational leverage
   - harder to manage at scale

Chosen approach: **single app + tenant slug + Firestore shop config**.

## Product Naming

- Product name: `WrapPilot`
- Product posture: platform-owned visualizer with tenant-aware branding
- Default UI language should describe the product and experience, not a specific installer

## Brand Replacement Direction

The current UI contains hardcoded Lux Garage references in:

- browser title
- landing hero and CTA copy
- booking section copy and links
- visualizer header links and logo alt text

The rename should do more than replace words. The base app should become neutral and product-first:

- remove Lux-specific outbound links
- remove hardcoded Lux logo usage from the default shell
- replace shop-owned CTA language with product-owned CTA language
- leave space for future tenant branding to layer in cleanly

## Tenant Model

Each shop should be stored in Firestore in a `shops` collection.

Recommended document shape:

```json
{
  "slug": "luxdrive",
  "shopName": "",
  "logoUrl": "",
  "accentColor": "",
  "leadEmail": "",
  "status": "active"
}
```

Notes:

- `slug` is the primary tenant key in v1
- `status` supports instant suspend / revoke without affecting other tenants
- the model should stay open to future hostname mapping without requiring a schema rewrite

## Routing Model

The tenant should be resolved from the URL path:

- landing page: `/:slug`
- visualizer page: `/:slug/visualizer`

The backend and frontend should both treat `slug` as tenant context, but the backend remains the source of truth for routing and delivery decisions.

This design allows:

- one deployment for all customers
- simple onboarding by creating a new Firestore document
- clean attribution for every generated lead
- future custom-domain support without changing the lead model

## Lead and Delivery Flow

V1 lead flow:

1. Customer visits `WrapPilot` on a tenant URL such as `wrappilot.com/luxdrive`
2. Frontend loads tenant branding from Firestore-backed data
3. Customer generates an image
4. Customer submits name, email, and phone
5. Frontend sends the lead payload plus `slug` and generated image identifier to the backend
6. Backend resolves the tenant again by `slug`
7. Backend stores a lead record with customer info, tenant info, image URL, and delivery status
8. WrapPilot sends the customer their preview from one centralized WrapPilot sender
9. WrapPilot sends the shop lead to the tenant's `leadEmail`

Important rules:

- the frontend never chooses the destination email address
- the backend always resolves the tenant and routes delivery from trusted config
- the generated image link should be a stable WrapPilot-hosted URL, not an expiring signed URL

## Generated Image Persistence

The current app serves generated images through its own `/generated/:fileName` route rather than returning Firebase signed URLs. That pattern should continue.

Why:

- links do not expire on a timer
- bucket objects can remain private
- customer emails and future SMS links can reference stable application URLs

Operational implication:

- generated files must be retained for as long as customer/shop links are expected to work
- if retention rules are introduced later, they should be explicit product policy rather than implicit URL expiry

## Admin and Revoke Model

V1 admin is internal-only:

- no shop login
- no self-service dashboard
- admins provision and update tenants directly in Firestore

Provisioning a new shop should only require:

- adding a `shops` document
- setting branding and routing fields
- sharing the tenant URL

Revoking a shop should only require:

- changing `status` from `active` to a disabled state such as `suspended`

## Non-Goals

- per-shop CRM integrations in v1
- client self-serve dashboards
- custom domain onboarding in v1
- tenant-specific page-builder level customization
- direct reliance on expiring Firebase signed URLs for customer delivery

## Verification

Success for this initiative means:

- the product presents itself as `WrapPilot` instead of Lux Garage
- tenant-aware routes exist
- tenant config comes from Firestore by slug
- leads are attributed to a specific shop
- customer delivery is centralized
- shop lead delivery is routed by `leadEmail`
- suspended shops can be disabled without code changes
