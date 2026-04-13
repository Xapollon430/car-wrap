# Backend Simplification Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `server/src/modules/*` with a flatter Express TypeScript backend (`routes/`, `controllers/`, `services/`) while preserving endpoint behavior.

**Architecture:** Consolidate startup in `server/src/index.ts`, move endpoint mapping into `routes`, request/response handling into `controllers`, and reusable business logic/data access into direct-import `services`. Remove DI/factory wiring and micro-validation helpers that add noise.

**Tech Stack:** Node.js, Express 5, TypeScript (NodeNext), Google Cloud Storage, Firestore, Gemini API, Nodemailer.

---

### Task 1: Create new backend layout and move shared domain types

**Files:**
- Create: `server/src/models/catalog.model.ts`
- Create: `server/src/models/shop.model.ts`
- Create: `server/src/models/lead.model.ts`
- Create: `server/src/db/firebase.ts`

**Step 1: Add model types**
- Move catalog/shop/lead type definitions from old module files into `models/*`.

**Step 2: Add Firestore bootstrap**
- Export `firestore` from `db/firebase.ts` using `process.env.FIRESTORE_DATABASE_ID`.

**Step 3: Verify compilation for created files**
Run: `npm --prefix server run typecheck`
Expected: Typecheck still succeeds or only fails for not-yet-migrated imports.

### Task 2: Rebuild services without module factories

**Files:**
- Create: `server/src/services/catalog.service.ts`
- Create: `server/src/services/generation.service.ts`
- Create: `server/src/services/generated-image.service.ts`
- Create: `server/src/services/gemini.client.ts`
- Create: `server/src/services/shops.service.ts`
- Create: `server/src/services/leads.service.ts`

**Step 1: Migrate catalog and media logic**
- Keep existing behavior for load/upload/commit/delete/media read.

**Step 2: Migrate generation logic**
- Preserve prompt generation and cached image behavior.

**Step 3: Migrate shops and leads logic**
- Preserve active-shop guard and lead email delivery state updates.

**Step 4: Keep validation lightweight in service/controller boundaries**
- Remove duplicated parsing helpers; keep required checks and filename safety.

### Task 3: Rebuild controllers and routes

**Files:**
- Create: `server/src/controllers/catalog.controller.ts`
- Create: `server/src/controllers/generation.controller.ts`
- Create: `server/src/controllers/leads.controller.ts`
- Create: `server/src/controllers/shops.controller.ts`
- Create: `server/src/routes/catalog.ts`
- Create: `server/src/routes/generation.ts`
- Create: `server/src/routes/leads.ts`
- Create: `server/src/routes/shops.ts`

**Step 1: Route mapping**
- Keep all existing paths mounted under `/api` and asset endpoints.

**Step 2: Controller behavior**
- Preserve status codes and core payload contracts.
- Allow minor response cleanup only where safe.

**Step 3: Error behavior**
- Keep try/catch behavior via `asyncRoute` and existing `errorMiddleware`.

### Task 4: Replace startup and env handling

**Files:**
- Modify: `server/src/index.ts`
- Delete: `server/src/app.ts`
- Delete: `server/src/config/env.ts`
- Add: `server/.env.example`

**Step 1: Inline env reads in entrypoint**
- Use `process.env.*` and minimal guard checks.

**Step 2: Wire middleware + mounts**
- JSON middleware, `/healthz`, `/api` routers, static fallback.

**Step 3: Preserve startup logging**
- Keep informative startup message including port/model/bucket.

### Task 5: Move or update tests and remove old modules

**Files:**
- Move/Modify tests under new structure:
  - `server/src/config/env.test.ts` -> `server/src/index.test.ts` or removed if obsolete
  - `server/src/modules/catalog/catalog.helpers.test.ts` -> `server/src/services/catalog.service.test.ts` (or helper-adjacent)
  - `server/src/modules/shops/shops.service.test.ts` -> `server/src/services/shops.service.test.ts`
- Delete: `server/src/modules/**`

**Step 1: Update tests for new imports**
- Keep existing assertions where behavior is unchanged.

**Step 2: Remove obsolete files**
- Delete old module/config/app files after new imports are in place.

**Step 3: Verify clean server graph**
Run: `rg "src/modules|config/env|createApp" server/src`
Expected: no references remain.

### Task 6: Full verification

**Files:**
- Modify as needed from verification feedback.

**Step 1: Run test suite**
Run: `npm --prefix server test`
Expected: all tests pass.

**Step 2: Run typecheck**
Run: `npm --prefix server run typecheck`
Expected: zero type errors.

**Step 3: Startup smoke check**
Run: `npm --prefix server run start`
Expected: server starts and logs listening message.

**Step 4: Final sanity grep**
Run: `rg "readParam\(|readOptionalString\(|createEnv\(|loadEnv\(" server/src`
Expected: no leftover micro wrappers from old architecture.
