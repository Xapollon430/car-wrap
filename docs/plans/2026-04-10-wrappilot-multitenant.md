# WrapPilot Multi-Tenant Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rename the product to WrapPilot, remove single-shop Lux branding, and introduce tenant-by-slug routing with Firestore-backed shop config and tenant-aware lead routing.

**Architecture:** Keep one shared frontend and backend deployment. Resolve tenant context from the URL slug, load light branding from Firestore, and route customer/shop delivery on the backend using trusted tenant config. Preserve stable generated image URLs through the existing `/generated/:fileName` application route.

**Tech Stack:** React 19, React Router 7, TypeScript, Express 5, Firebase/Google Cloud Storage, Firestore, Framer Motion

---

### Task 1: Rename the default product shell to WrapPilot

**Files:**
- Modify: `client/index.html`
- Modify: `client/src/pages/VisualizerPage.tsx`
- Modify: `client/src/features/landing/components/HeroSection.tsx`
- Modify: `client/src/features/landing/components/BookingSection.tsx`
- Modify: `client/src/features/landing/content.ts`

**Step 1: Write down the rename targets**

Capture the current Lux-specific strings with:

```bash
cd /Users/vehbikaraagac/Desktop/car-wrap
rg -n "Lux|lux|LuxDrive|Lux Drive" client
```

Expected: matches in `client/index.html`, the landing hero and booking components, and the visualizer page.

**Step 2: Replace product-facing Lux branding with WrapPilot**

Update copy so the default product shell is neutral and product-owned:

- browser title becomes `WrapPilot`
- visualizer header becomes WrapPilot-branded instead of Lux-linked
- landing hero uses WrapPilot product messaging
- booking CTA becomes a product CTA rather than a Lux-specific outbound booking link

**Step 3: Remove hardcoded Lux-only assets and links from the default shell**

Keep the existing layout, but stop depending on:

- `https://luxgaragedmv.com/`
- Lux-specific `aria-label` / alt text
- Lux-specific call-to-action wording

Use internal navigation or neutral placeholders where needed.

**Step 4: Run client verification**

Run:

```bash
cd /Users/vehbikaraagac/Desktop/car-wrap/client
npm run lint
npm run build
```

Expected: both commands pass.

**Step 5: Commit**

```bash
cd /Users/vehbikaraagac/Desktop/car-wrap
git add client/index.html client/src/pages/VisualizerPage.tsx client/src/features/landing/components/HeroSection.tsx client/src/features/landing/components/BookingSection.tsx client/src/features/landing/content.ts
git commit -m "feat: rename default product shell to wrappilot"
```

### Task 2: Add tenant-aware client routes by slug

**Files:**
- Modify: `client/src/App.tsx`
- Modify: `client/src/pages/LandingPage.tsx`
- Modify: `client/src/pages/VisualizerPage.tsx`
- Create: `client/src/features/tenant/types.ts`
- Create: `client/src/features/tenant/useTenantSlug.ts`

**Step 1: Write a failing route expectation**

Document the intended behavior in a lightweight server/client smoke checklist:

- `/:slug` loads the landing page
- `/:slug/visualizer` loads the visualizer
- old non-tenant routes should redirect to a safe default or not-found path

If adding a client test harness is out of scope, treat this as a manual route-verification checklist rather than introducing new test infrastructure.

**Step 2: Add slug-based route structure**

Update `App.tsx` so the app routes through tenant-aware paths:

- `/:slug`
- `/:slug/visualizer`

Add a small helper hook to read and validate the slug from route params.

**Step 3: Thread slug access into the two page shells**

Update the landing and visualizer pages so they can read the active slug and prepare for tenant config loading.

**Step 4: Run client verification**

Run:

```bash
cd /Users/vehbikaraagac/Desktop/car-wrap/client
npm run lint
npm run build
```

Expected: both commands pass.

**Step 5: Commit**

```bash
cd /Users/vehbikaraagac/Desktop/car-wrap
git add client/src/App.tsx client/src/pages/LandingPage.tsx client/src/pages/VisualizerPage.tsx client/src/features/tenant/types.ts client/src/features/tenant/useTenantSlug.ts
git commit -m "feat: add tenant-aware client routes"
```

### Task 3: Add Firestore-backed shop configuration on the server

**Files:**
- Modify: `server/src/config/env.ts`
- Create: `server/src/lib/firestore.ts`
- Create: `server/src/modules/shops/shops.types.ts`
- Create: `server/src/modules/shops/shops.repository.ts`
- Create: `server/src/modules/shops/shops.service.ts`
- Create: `server/src/modules/shops/shops.routes.ts`
- Modify: `server/src/app.ts`

**Step 1: Write the server-side contract**

Add a small repository/service contract for a `shops` collection with fields:

- `slug`
- `shopName`
- `logoUrl`
- `accentColor`
- `leadEmail`
- `status`

**Step 2: Add environment support for Firestore access**

Extend env loading to include the minimum Firestore configuration needed by the existing deployment model.

**Step 3: Implement a shop lookup module**

Create a focused module that can:

- load a shop by slug
- return `null` for missing tenants
- reject non-active tenants in the service layer

Expose a simple API route such as `GET /api/shops/:slug` for the frontend.

**Step 4: Run server verification**

Run:

```bash
cd /Users/vehbikaraagac/Desktop/car-wrap/server
npm run typecheck
npm test
```

Expected: typecheck passes and the server test suite remains green.

**Step 5: Commit**

```bash
cd /Users/vehbikaraagac/Desktop/car-wrap
git add server/src/config/env.ts server/src/lib/firestore.ts server/src/modules/shops/shops.types.ts server/src/modules/shops/shops.repository.ts server/src/modules/shops/shops.service.ts server/src/modules/shops/shops.routes.ts server/src/app.ts
git commit -m "feat: add firestore-backed shop configuration"
```

### Task 4: Load tenant config in the client and apply light branding

**Files:**
- Create: `client/src/api/shops.ts`
- Create: `client/src/features/tenant/useShop.ts`
- Modify: `client/src/pages/LandingPage.tsx`
- Modify: `client/src/pages/VisualizerPage.tsx`
- Modify: `client/src/features/landing/components/HeroSection.tsx`
- Modify: `client/src/features/landing/components/BookingSection.tsx`

**Step 1: Write the UI state contract**

Define explicit UI states for:

- loading tenant
- missing tenant
- suspended tenant
- active tenant

**Step 2: Add a tenant fetch helper and hook**

Fetch shop config from `GET /api/shops/:slug` and expose a small hook that returns the tenant plus its loading/error state.

**Step 3: Apply light branding**

Use tenant data to swap:

- shop name
- logo
- accent color

Keep the overall page structure generic and product-owned.

**Step 4: Add graceful fallback states**

Show clean UI for:

- shop not found
- inactive shop
- tenant still loading

**Step 5: Run client verification**

Run:

```bash
cd /Users/vehbikaraagac/Desktop/car-wrap/client
npm run lint
npm run build
```

Expected: both commands pass.

**Step 6: Commit**

```bash
cd /Users/vehbikaraagac/Desktop/car-wrap
git add client/src/api/shops.ts client/src/features/tenant/useShop.ts client/src/pages/LandingPage.tsx client/src/pages/VisualizerPage.tsx client/src/features/landing/components/HeroSection.tsx client/src/features/landing/components/BookingSection.tsx
git commit -m "feat: load tenant branding by slug"
```

### Task 5: Make the lead flow tenant-aware and backend-routed

**Files:**
- Modify: `client/src/features/visualizer/components/SaveLeadModal.tsx`
- Modify: `server/src/modules/generation/generation.routes.ts`
- Create: `server/src/modules/leads/leads.types.ts`
- Create: `server/src/modules/leads/leads.repository.ts`
- Create: `server/src/modules/leads/leads.service.ts`

**Step 1: Extend the lead payload with tenant context**

Update the frontend save flow to send:

- `slug`
- customer name, email, phone
- generated image identifier
- generated image URL

Do not send the destination shop email from the client.

**Step 2: Persist tenant-aware lead records**

Create a lead model that stores:

- `shopSlug`
- `shopName`
- customer fields
- image fields
- created timestamp
- customer delivery status
- shop delivery status

**Step 3: Route delivery using trusted shop config**

Change `/api/leads/save-image` so it:

- resolves the shop by `slug`
- rejects missing or inactive shops
- stores the lead
- prepares delivery using central WrapPilot sender + shop `leadEmail`

The notification implementations can stay simple at first, but the backend contract must become tenant-aware now.

**Step 4: Run server and client verification**

Run:

```bash
cd /Users/vehbikaraagac/Desktop/car-wrap/server
npm run typecheck
npm test
```

Run:

```bash
cd /Users/vehbikaraagac/Desktop/car-wrap/client
npm run lint
npm run build
```

Expected: all commands pass.

**Step 5: Commit**

```bash
cd /Users/vehbikaraagac/Desktop/car-wrap
git add client/src/features/visualizer/components/SaveLeadModal.tsx server/src/modules/generation/generation.routes.ts server/src/modules/leads/leads.types.ts server/src/modules/leads/leads.repository.ts server/src/modules/leads/leads.service.ts
git commit -m "feat: route leads by tenant slug"
```

### Task 6: Add inactive-tenant protection and operational seed data

**Files:**
- Modify: `server/src/modules/shops/shops.service.ts`
- Create: `docs/plans/tenant-seed-example.md`
- Optional Create: `server/scripts/seed-shops.ts`

**Step 1: Enforce inactive-tenant handling**

Make the service reject tenants whose `status` is not active with a clear error response suitable for both page load and lead submission flows.

**Step 2: Add seed examples for manual Firestore entry**

Create a short operator doc with example Firestore shop objects:

```json
{
  "slug": "demo-shop",
  "shopName": "Demo Wrap Shop",
  "logoUrl": "",
  "accentColor": "#ff7a18",
  "leadEmail": "leads@example.com",
  "status": "active"
}
```

If useful, add a small seed script, but only if it reduces real operator friction.

**Step 3: Verify the inactive path**

Manual checks:

- active tenant loads
- suspended tenant shows a safe disabled state
- suspended tenant cannot submit a lead

**Step 4: Run final verification**

Run:

```bash
cd /Users/vehbikaraagac/Desktop/car-wrap/server
npm run typecheck
npm test
```

Run:

```bash
cd /Users/vehbikaraagac/Desktop/car-wrap/client
npm run lint
npm run build
```

Expected: all commands pass.

**Step 5: Commit**

```bash
cd /Users/vehbikaraagac/Desktop/car-wrap
git add server/src/modules/shops/shops.service.ts docs/plans/tenant-seed-example.md server/scripts/seed-shops.ts
git commit -m "feat: add tenant suspend controls and seed docs"
```
