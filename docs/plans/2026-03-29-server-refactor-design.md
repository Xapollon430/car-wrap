# Server Refactor Design

Date: 2026-03-29
Status: Approved

## Goal

Refactor the Express/TypeScript backend so `server/src/index.ts` stops owning routing, validation, storage access, and generation workflow in one file.

## Confirmed Decisions

- Keep Express and TypeScript.
- Preserve the current HTTP contract and Firebase Storage behavior.
- Split startup from app wiring.
- Group backend code by feature, not by generic layer names alone.
- Keep the refactor incremental instead of introducing a heavyweight architecture reset.

## Approaches Considered

1. Minimal extraction
   - move env loading and a few helpers out of `index.ts`
   - fastest, but likely leaves oversized route handlers
2. Feature-first split (recommended)
   - `index.ts` becomes composition root
   - `app.ts` owns Express wiring
   - shared env and error logic moves to `config` and `lib`
   - feature modules own catalog and generation behavior
3. Full layered architecture
   - separate domain, application, infrastructure, and transport everywhere
   - cleaner on paper, but more abstraction than this repo needs today

Chosen approach: **feature-first split** for the best balance of maintainability, clarity, and implementation risk.

## Target Structure

```text
server/src/
  index.ts
  app.ts
  config/
    env.ts
  lib/
    errors.ts
    http.ts
  modules/
    catalog/
      catalog.helpers.ts
      catalog.repository.ts
      catalog.routes.ts
      catalog.service.ts
      catalog.types.ts
      catalog.validation.ts
    generation/
      gemini.client.ts
      generation.helpers.ts
      generation.repository.ts
      generation.routes.ts
      generation.service.ts
      generation.validation.ts
```

## Responsibility Split

- `index.ts`
  - load env
  - create bucket and feature dependencies
  - build app
  - start listening
- `app.ts`
  - create the Express app
  - mount middleware, routes, static serving, and error middleware
- `config/env.ts`
  - parse and normalize runtime config once
- `modules/catalog/*`
  - catalog listing, upload URL creation, commit/delete workflow, catalog media streaming
- `modules/generation/*`
  - generate request validation, prompt construction, cached/generated image handling, Gemini integration
- `lib/*`
  - reusable `HttpError`, async route wrapper, and shared error/message helpers

## Non-Goals

- changing client APIs
- changing bucket object naming behavior
- introducing NestJS, DI containers, or base class hierarchies
- redesigning the generation workflow

## Verification

Success is defined by:

- `server/src/index.ts` becoming a small composition root
- feature behavior remaining the same
- backend code reading by responsibility instead of one-file orchestration
- server tests passing for extracted pure modules
- TypeScript compilation passing for `server/`
