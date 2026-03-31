# Server Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split the Express/TypeScript backend into a small composition root plus feature modules for catalog and generation without changing the external API.

**Architecture:** Extract env parsing and app bootstrapping from `index.ts`, move shared HTTP/error helpers into `lib`, and organize backend behavior into `catalog` and `generation` modules with thin route files and service/repository boundaries.

**Tech Stack:** TypeScript, Express, `tsx`, Firebase Storage, Gemini SDK, Node test runner

---

### Task 1: Add characterization tests for extracted pure modules

**Files:**
- Create: `server/src/config/env.test.ts`
- Create: `server/src/modules/catalog/catalog.helpers.test.ts`

**Step 1: Write the failing tests**

- Add tests for env parsing defaults and required bucket validation.
- Add tests for catalog helper behavior such as slugification, upload extension normalization, and file name sanitization.

**Step 2: Run tests to verify they fail**

Run: `cd server && npx tsx --test src/config/env.test.ts src/modules/catalog/catalog.helpers.test.ts`
Expected: FAIL because the extracted modules do not exist yet.

### Task 2: Extract config and shared helpers

**Files:**
- Create: `server/src/config/env.ts`
- Create: `server/src/lib/errors.ts`
- Create: `server/src/lib/http.ts`
- Modify: `server/src/index.ts`

**Step 1: Implement `config/env.ts`**

- Create a pure env parser plus a runtime loader that reads `.env` from `server/` and repo root.

**Step 2: Implement shared error and async route helpers**

- Add `HttpError`, `messageFromError`, and an async Express wrapper.

**Step 3: Re-run the new tests**

Run: `cd server && npx tsx --test src/config/env.test.ts src/modules/catalog/catalog.helpers.test.ts`
Expected: env tests pass and catalog helper tests still fail.

### Task 3: Extract catalog module

**Files:**
- Create: `server/src/modules/catalog/catalog.types.ts`
- Create: `server/src/modules/catalog/catalog.helpers.ts`
- Create: `server/src/modules/catalog/catalog.validation.ts`
- Create: `server/src/modules/catalog/catalog.repository.ts`
- Create: `server/src/modules/catalog/catalog.service.ts`
- Create: `server/src/modules/catalog/catalog.routes.ts`
- Modify: `server/src/index.ts`

**Step 1: Move catalog types and pure helper logic out of `index.ts`**

- Extract catalog kinds, response types, file-name helpers, MIME normalization, and slugification.

**Step 2: Move storage and manifest persistence into a repository**

- Encapsulate reading/writing catalog JSON, upload URL generation, and catalog media lookup.

**Step 3: Move business workflow into a service**

- Keep catalog list, upload URL creation, commit, and delete behavior outside route files.

**Step 4: Add route wiring**

- Mount `/api/catalog` and `/catalog-media` from a router module.

**Step 5: Re-run tests**

Run: `cd server && npx tsx --test src/config/env.test.ts src/modules/catalog/catalog.helpers.test.ts`
Expected: PASS.

### Task 4: Extract generation module and app wiring

**Files:**
- Create: `server/src/app.ts`
- Create: `server/src/modules/generation/generation.helpers.ts`
- Create: `server/src/modules/generation/generation.validation.ts`
- Create: `server/src/modules/generation/generation.repository.ts`
- Create: `server/src/modules/generation/generation.service.ts`
- Create: `server/src/modules/generation/generation.routes.ts`
- Create: `server/src/modules/generation/gemini.client.ts`
- Modify: `server/src/index.ts`
- Delete or replace: `server/src/gemini.ts`

**Step 1: Extract generation prompt and filename helpers**

- Move prompt construction and generated-image naming helpers into generation-local modules.

**Step 2: Move generated image storage and cache lookup into a repository**

- Encapsulate read/write/delete behavior for generated images.

**Step 3: Move `/api/generate` workflow into a service**

- Keep catalog lookup, cache hit logic, Gemini call, and output write logic out of route handlers.

**Step 4: Split app creation from startup**

- `app.ts` should build the Express app, mount feature routers, static serving, and error middleware.
- `index.ts` should load env, construct dependencies, and call `listen`.

### Task 5: Verification

**Files:**
- Modify: `server/package.json` if a test or typecheck script improves repeatability

**Step 1: Run tests**

Run: `cd server && npx tsx --test src/config/env.test.ts src/modules/catalog/catalog.helpers.test.ts`
Expected: PASS.

**Step 2: Run typecheck**

Run: `cd server && npx tsc -p tsconfig.json --noEmit`
Expected: PASS.

**Step 3: Optionally start the server**

Run: `cd server && npm run start`
Expected: server boots if env vars are present; otherwise it should fail only on missing required runtime config.
