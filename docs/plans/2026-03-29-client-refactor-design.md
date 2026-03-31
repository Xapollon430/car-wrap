# Client Refactor Design

Date: 2026-03-29
Status: Approved

## Goal

Refactor the client into a smaller, more readable React codebase by splitting large pages by responsibility, removing unnecessary test/config surface, and simplifying state ownership without preserving every current implementation detail.

## Confirmed Product Decisions

- Refactor can be moderately aggressive and may simplify or remove weak UI details if it improves maintainability.
- The client test harness should be removed entirely.
- Verification should rely on lint and build, not client-side tests.

## Approaches Considered

1. Minimal cleanup
   - move a few components out of large files
   - delete tests
   - leave page-level state mostly unchanged
2. Feature-sliced refactor (recommended)
   - split landing and visualizer code by feature responsibility
   - keep pages as shells
   - extract feature components and a focused visualizer hook
   - remove test-only config and dependencies
3. Architectural reset
   - introduce reducers or a more formal state machine
   - large API and state-model churn

Chosen approach: **feature-sliced refactor** for the best balance between clarity and implementation risk.

## Architecture Direction

### Client Structure

The client should read by responsibility instead of by page-file size:

- `client/src/pages/`
  - page shells only
- `client/src/features/landing/`
  - static content and landing-specific sections
- `client/src/features/visualizer/`
  - visualizer-specific components, hook, and helpers
- `client/src/components/`
  - only genuinely cross-feature UI, such as `ImageModal`
- `client/src/api/`
  - request helpers only
- `client/src/types/`
  - shared client types only when truly reused

### React State Ownership

The visualizer currently centralizes too much unrelated state in one page file. The refactor should:

- keep route ownership in `VisualizerPage`
- move catalog loading, upload/delete actions, selection state, and generation state into a focused visualizer hook
- move repeated car/wrap selector UI into a reusable `SelectorPanel`
- move preview rendering into a `PreviewPanel`
- move upload modal logic into its own component

State principles:

- derive filtered lists, page counts, visible slices, and selected labels from base state
- keep event-triggered work in handlers
- use effects only for external synchronization
- avoid new context or global stores

## Target File Responsibilities

### Landing

- `LandingPage.tsx`
  - shell only
  - imports landing sections/content
- landing feature files
  - hold arrays such as services, gallery, and testimonials
  - own landing section components and motion presets

### Visualizer

- `VisualizerPage.tsx`
  - thin feature shell
- `features/visualizer/hooks/useVisualizer.ts`
  - catalog fetch/load state
  - upload/delete/generate actions
  - selection state
  - upload modal state
- `features/visualizer/components/SelectorPanel.tsx`
  - search row
  - upload button
  - loading/empty/error states
  - selector grid
  - pagination footer
- `features/visualizer/components/PreviewPanel.tsx`
  - selected names
  - generate CTA
  - preview image and fullscreen affordance
- `features/visualizer/components/UploadCatalogModal.tsx`
  - upload form only

## Config and Dependency Cleanup

The refactor should remove test-only client surface:

- delete client tests and test helpers
- remove `vitest`, `jsdom`, and Testing Library dependencies
- remove the `test` script from `client/package.json`
- remove test config from `client/vite.config.ts`
- remove test types from `client/tsconfig.app.json`

The following config files stay because they are part of a normal Vite + TypeScript setup:

- `client/vite.config.ts`
- `client/eslint.config.js`
- `client/tsconfig.json`
- `client/tsconfig.app.json`
- `client/tsconfig.node.json`

## Non-Goals

- introducing Zustand or context state
- changing server APIs
- redesigning the entire visual style
- adding a new client testing strategy

## Verification

Success is defined by:

- smaller page shells
- clearer feature folders
- no client tests or test-only config
- `npm run lint` passing in `client/`
- `npm run build` passing in `client/`
