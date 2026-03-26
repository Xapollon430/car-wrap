# Car Wrap Visualizer Design

Date: 2026-03-25
Status: Approved

## Goal

Build a simple React frontend that lets users:
- choose one car image from 10 common wrap candidate cars
- choose one wrap color/image from 10 common wraps
- click `Generate` to call a mocked placeholder API
- view the returned generated image

No backend/server work is included in this version.

## Confirmed Product Decisions

- UX flow: simple selection + generate
- Generate behavior: mocked frontend client for now
- Data source: hardcoded manifests for cars and wraps
- Stack: React + TypeScript

## Approaches Considered

1. Single-page stateful UI (recommended)
2. Componentized UI with custom hook
3. Reducer-based state machine

Chosen approach: **single-page stateful UI** for fastest, clearest v1 delivery with low complexity.

## Architecture

- Framework: React (Vite) with TypeScript
- Static assets:
  - `public/cars` (10 files)
  - `public/wraps` (10 files)
- Data manifests:
  - `src/data/cars.ts` (id, label, imagePath)
  - `src/data/wraps.ts` (id, label, imagePath)
- Mock API:
  - `src/api/generateMock.ts`
  - accepts selected car/wrap
  - simulates async latency
  - returns generated image URL + metadata
- UI state in `App.tsx`:
  - `selectedCarId`
  - `selectedWrapId`
  - `isGenerating`
  - `generatedImageUrl`
  - `errorMessage`

## Component Design

- `App` container: orchestrates state and generate action
- `CarSelector`: renders selectable grid of 10 car cards
- `WrapSelector`: renders selectable grid of 10 wrap cards/swatches
- `ResultPanel`:
  - selection summary
  - generate button
  - generated image display / placeholder
  - loading + error message rendering

## Data Flow

1. App loads car and wrap manifests.
2. User selects one car and one wrap.
3. User clicks `Generate`.
4. App calls `generateMock({ car, wrap })`.
5. Mock resolves with image URL.
6. Result panel renders returned image.
7. Subsequent generate actions replace previous result.

## States and Error Handling

- Empty state:
  - instructional text before selection
  - no-result text before first generation
- Disabled state:
  - `Generate` disabled until both selections exist
- Loading state:
  - generating indicator shown while awaiting mock response
- Error state:
  - inline retry-friendly error message
  - preserve last successful image when possible

## Test Scope (v1)

- Unit tests:
  - `generateMock` success response
  - `generateMock` simulated failure path
- Component tests:
  - generate button enable/disable rules
  - loading state appears during generation
  - result image appears after success
  - error message appears on failure
- Manual checks:
  - responsive layout on desktop/mobile
  - all 10 cars and 10 wraps render
  - visible selection highlighting
  - accessible labels for selector controls and generate button

## Non-Goals (v1)

- Real AI generation integration
- Backend services
- User auth/accounts
- Persistence/history
- Multi-step editing workflows

