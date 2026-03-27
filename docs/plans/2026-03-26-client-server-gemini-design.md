# Client/Server Split with Gemini Image Generation Design

Date: 2026-03-26
Status: Approved

## Goal

Restructure the project into `client` and `server`, where:
- `client` sends only selected car/wrap names
- `server` resolves and loads real car/wrap image files
- `server` calls Gemini image generation API with those images
- generated image is saved locally and displayed in the UI

## Confirmed Product Decisions

- Move frontend project under `/client`
- Create a new Go backend under `/server`
- Client sends only `{ carName, wrapName }`
- Server resolves names to actual files from shared data
- Shared static assets stay under root `/public`
- Server writes generated outputs to `/public/generated`
- UI displays generated output via returned image URL

## Architecture

Repository layout:
- `/client` - existing React app
- `/server` - Go API service
- `/public` - shared static assets
  - `/public/cars`
  - `/public/wraps`
  - `/public/generated`
- `/shared` - shared manifest for client and server
  - `/shared/catalog.json`

Data ownership:
- `catalog.json` is the single source of truth for:
  - car label -> image path
  - wrap label -> image path
- client reads catalog for selector UI
- server reads same catalog for name-to-file resolution

## API Contract

Endpoint:
- `POST /api/generate`

Request JSON:
- `carName: string`
- `wrapName: string`

Success response:
- `imageUrl: string` (example: `/generated/gen_20260326_212211.png`)
- `prompt: string`

Error response:
- `error: string`

## Generation Flow

1. Client sends car/wrap names.
2. Server validates input fields.
3. Server loads shared catalog and finds matching entries.
4. Server reads corresponding car and wrap image files from `/public`.
5. Server calls Gemini image API with:
   - text prompt
   - car image inline data
   - wrap image inline data
6. Server extracts generated image bytes from Gemini response.
7. Server writes file into `/public/generated`.
8. Server returns `/generated/<filename>.png`.
9. Client displays image and keeps modal/maximize behavior.

## Gemini Configuration

Server env vars:
- `GEMINI_API_KEY` (required)
- `GEMINI_MODEL` (default: `gemini-2.5-flash-image`)
- `PORT` (default: `8080`)

Prompt strategy:
- include car and wrap names in instruction
- request realistic wrap application
- ask for neutral angle and clean background for consistent previews

## Client Integration

- Replace mock API call with backend API call.
- Keep existing selection/search/modal UX.
- Vite dev proxy routes:
  - `/api/*` -> Go server
  - `/generated/*` -> Go server static file route (or same host route)
- `client` configured to use `../public` as `publicDir`.

## Error Handling

Client:
- show API error message inline in preview panel
- keep previous successful image when generation fails

Server:
- return `400` for validation/match errors
- return `500` for Gemini response parse or file write issues
- avoid leaking sensitive details in error bodies

## Testing Scope

Server tests:
- input validation
- catalog lookup
- handler success path with mocked Gemini client
- handler error paths

Client tests:
- generation request sends selected names
- successful response updates preview image
- error response renders error message

Verification:
- run both services locally
- generate once
- verify output file appears in `/public/generated`
- confirm UI displays returned generated image and modal still works
