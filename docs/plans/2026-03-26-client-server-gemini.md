# Client/Server Gemini Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Split the app into `/client` and `/server`, and implement server-side Gemini image generation that uses shared car/wrap image assets while client sends only names.

**Architecture:** Keep shared static assets at root `/public` and introduce `/shared/catalog.json` as one source of truth. Move frontend into `/client` and add a Go server in `/server` with `POST /api/generate` that resolves names from catalog, sends car/wrap images to Gemini, writes output to `/public/generated`, and returns the generated image URL to UI.

**Tech Stack:** React, TypeScript, Vite, Vitest, Go (net/http), Gemini REST API

---

Execution guidance:
- Use `@test-driven-development` for client and server changes.
- Use `@systematic-debugging` for failing integration paths.
- Use `@verification-before-completion` before completion claim.

### Task 1: Reorganize Repo into `client` and Shared Root Data

**Files:**
- Move: project frontend files into `client/*`
- Create: `shared/catalog.json`
- Modify: `client/vite.config.ts`
- Modify: `client/package.json`
- Modify: root `README.md`

**Step 1: Move frontend files under `/client`**

Move:
- `src`, `public`, `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*`, `eslint.config.js`, `index.html`
to `/client` as needed.

Then move `client/public` back to root `/public` (shared).

**Step 2: Create shared catalog**

Create `shared/catalog.json` with:
- cars array: `{ "id", "label", "imagePath" }`
- wraps array: `{ "id", "label", "imagePath" }`

Image paths should remain root-public relative (e.g. `/cars/toyota-camry.jpg`).

**Step 3: Update client to consume root public**

In `client/vite.config.ts`, set:

```ts
publicDir: '../public'
```

and proxy:

```ts
server: {
  proxy: {
    '/api': 'http://localhost:8080',
    '/generated': 'http://localhost:8080',
  },
}
```

**Step 4: Run client tests to ensure move is safe**

Run: `cd client && npm run test -- --run`
Expected: existing tests pass or fail only on expected path updates.

**Step 5: Commit**

```bash
git add .
git commit -m "chore: move frontend to client and add shared catalog scaffold"
```

### Task 2: Client Reads Shared Catalog and Uses Name-Only API Request

**Files:**
- Create: `client/src/data/catalog.ts`
- Modify: `client/src/data/cars.ts`
- Modify: `client/src/data/wraps.ts`
- Create: `client/src/api/generateFromServer.ts`
- Modify: `client/src/App.tsx`
- Modify: `client/src/App.generate.test.tsx`

**Step 1: Write failing client API test**

In `client/src/App.generate.test.tsx`, add a test that asserts:
- request body contains only `carName` and `wrapName`
- on success, UI uses `imageUrl` from server response.

Mock `fetch` and verify payload shape.

**Step 2: Run test to verify fail**

Run: `cd client && npm run test -- --run src/App.generate.test.tsx`
Expected: FAIL before new API module wiring.

**Step 3: Implement catalog loader and API client**

- `catalog.ts`: static import JSON and export typed `cars`, `wraps`.
- update `cars.ts`/`wraps.ts` to re-export from catalog (or remove and import catalog directly in `App`).
- add `generateFromServer.ts`:
  - POST `/api/generate`
  - body `{ carName, wrapName }`
  - return `{ imageUrl, prompt }`
  - throw clean error on non-2xx.

**Step 4: Replace mock generation call**

In `App.tsx`, replace `generateMock` with `generateFromServer`.

**Step 5: Re-run test**

Run: `cd client && npm run test -- --run src/App.generate.test.tsx`
Expected: PASS.

**Step 6: Commit**

```bash
git add client/src
git commit -m "feat(client): call backend generate endpoint with car and wrap names"
```

### Task 3: Create Go Server Skeleton and Generate Endpoint Contract

**Files:**
- Create: `server/go.mod`
- Create: `server/cmd/server/main.go`
- Create: `server/internal/http/handlers.go`
- Create: `server/internal/catalog/catalog.go`
- Create: `server/internal/http/handlers_test.go`
- Create: `server/.env.example`
- Create: `server/generated/.gitkeep` (optional)

**Step 1: Write failing handler tests**

Add tests for:
- `400` when missing `carName`/`wrapName`
- `400` when name not found in catalog
- success path returns `imageUrl` and `prompt` (with fake generator).

**Step 2: Run tests to verify fail**

Run: `cd server && go test ./...`
Expected: FAIL until handlers are implemented.

**Step 3: Implement minimal HTTP server**

- route `POST /api/generate`
- route static `GET /generated/*` serving `../public/generated`
- parse request JSON and validate fields
- catalog lookup from `../shared/catalog.json`
- call generator interface (stub for now).

**Step 4: Re-run tests**

Run: `cd server && go test ./...`
Expected: PASS for contract tests.

**Step 5: Commit**

```bash
git add server
git commit -m "feat(server): add generate API contract and catalog resolution"
```

### Task 4: Gemini Client Integration (Images + Prompt) and Local Write

**Files:**
- Create: `server/internal/gemini/client.go`
- Modify: `server/internal/http/handlers.go`
- Create: `server/internal/gemini/client_test.go` (parsing/unit coverage)

**Step 1: Add failing tests for Gemini response parsing**

Create tests that feed representative Gemini JSON and assert extracted bytes/error paths.

**Step 2: Run tests to verify fail**

Run: `cd server && go test ./internal/gemini -v`
Expected: FAIL before parser/client implementation.

**Step 3: Implement Gemini REST call**

- Read env:
  - `GEMINI_API_KEY` required
  - `GEMINI_MODEL` default `gemini-2.5-flash-image`
- Load selected car and wrap image files.
- Convert to base64 inline data.
- Build request with text + two images.
- Parse returned inline image bytes.
- Save PNG to `../public/generated/gen_<timestamp>.png`.
- Return relative URL `/generated/<filename>.png`.

**Step 4: Wire handler to real Gemini client**

Replace stub generator in main wiring with Gemini generator implementation.

**Step 5: Re-run tests**

Run: `cd server && go test ./...`
Expected: PASS.

**Step 6: Commit**

```bash
git add server/internal
git commit -m "feat(server): integrate Gemini image generation and local output writes"
```

### Task 5: Cross-App Integration, Docs, and Full Verification

**Files:**
- Modify: root `README.md`
- Modify: `client/README.md` (if present)

**Step 1: Document run instructions**

Document:
- server env setup (`GEMINI_API_KEY`, `GEMINI_MODEL`, `PORT`)
- run server command
- run client command
- expected generated output path `/public/generated`

**Step 2: Run full client verification**

Run:
- `cd client && npm run test -- --run`
- `cd client && npm run build`
- `cd client && npm run lint`

Expected: PASS.

**Step 3: Run full server verification**

Run:
- `cd server && go test ./...`

Expected: PASS.

**Step 4: Manual integration check**

Run both apps:
- `cd server && go run ./cmd/server`
- `cd client && npm run dev`

Generate one sample image and verify:
- file appears in `public/generated`
- UI displays it
- maximize modal still works

**Step 5: Commit final integration/docs**

```bash
git add README.md client/README.md
git commit -m "docs: add client/server setup and generation workflow"
```
