# Backend Simplification Design (Big-Bang Cutover)

## Goal
Replace the current `server/src/modules/*` backend with a flatter Express + TypeScript structure that is easier to read and maintain: `routes/`, `controllers/`, `services/`, plus lightweight `models/` and `db/` support.

## Approved Approach
Full cutover in one pass (big bang): migrate all server endpoints and domain logic at once, then delete `modules/`.

## Architecture
- `server/src/index.ts` becomes the primary entrypoint for:
  - `dotenv` loading
  - essential env guard checks
  - global middleware
  - `/healthz`
  - `/api/*` route mounts
  - static client serving + React fallback
  - `app.listen(...)`
- `server/src/routes/*.ts` map paths to controller handlers.
- `server/src/controllers/*.controller.ts` own request parsing, essential validation, and response shaping.
- `server/src/services/*.service.ts` own reusable business logic and storage/Firestore operations.
- `server/src/models/*.model.ts` store TypeScript domain types.

## Data Flow
- Request enters route -> controller validates required inputs -> service executes business/storage logic -> controller returns stable JSON response.
- Cross-cutting error responses continue through the shared Express error middleware.

## Validation Strategy
- Keep only meaningful validations:
  - required fields
  - basic email format check
  - allowed catalog kinds (`cars`/`wraps`)
  - safe generated/catalog filenames
- Remove tiny one-off wrappers that only forward values (`readParam`, duplicated `readOptionalString`, etc.).

## Compatibility + Cleanup
- Preserve existing endpoint paths.
- Preserve core behavior.
- Allow minor response cleanup where it improves clarity and does not break client expectations.

## Verification
- Run `npm --prefix server test`
- Run `npm --prefix server run typecheck`
- Smoke-check route wiring with a server start (`npm --prefix server run start`) and confirm startup log.

## Risks and Mitigations
- Risk: big-bang migration can miss imports/route wiring.
  - Mitigation: migrate route-by-route with immediate typecheck and test verification at the end.
- Risk: accidental behavior drift.
  - Mitigation: preserve endpoint paths and business logic semantics; only simplify structure and redundant validation plumbing.
