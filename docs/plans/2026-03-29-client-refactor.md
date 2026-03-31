# Client Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the client into smaller feature-focused React modules, remove the client test harness entirely, and simplify state/config so the codebase is easier to read and maintain.

**Architecture:** Keep `client/src/pages` as thin route shells, move landing and visualizer logic into feature folders, and extract visualizer state ownership into a focused hook plus parameterized feature components. Remove all client-side testing files and test-only dependencies/config, then verify with lint and production build only.

**Tech Stack:** React 19, TypeScript, Vite, Framer Motion, Tailwind CSS, React Router

---

Execution guidance:
- Follow `@writing-react-components` for state ownership and component boundaries.
- Per approved scope, do not add or keep client tests.
- Verify only with `npm run lint` and `npm run build` in `client/`.

### Task 1: Remove Client Test Surface

**Files:**
- Delete: `client/src/pages/VisualizerPage.test.tsx`
- Delete: `client/src/test/setup.ts`
- Delete: `client/src/test/renderWithRouter.tsx`
- Modify: `client/package.json`
- Modify: `client/package-lock.json`
- Modify: `client/vite.config.ts`
- Modify: `client/tsconfig.app.json`

**Step 1: Remove test files**

Delete:

```text
client/src/pages/VisualizerPage.test.tsx
client/src/test/setup.ts
client/src/test/renderWithRouter.tsx
```

**Step 2: Remove test script and dependencies**

Update `client/package.json`:
- remove `"test": "vitest"`
- remove:
  - `vitest`
  - `jsdom`
  - `@testing-library/react`
  - `@testing-library/jest-dom`
  - `@testing-library/user-event`

**Step 3: Remove test config and types**

Update:
- `client/vite.config.ts`
  - switch back to `defineConfig` from `vite`
  - remove `test` config block
- `client/tsconfig.app.json`
  - remove `vitest/globals`
  - remove `@testing-library/jest-dom`

**Step 4: Refresh lockfile**

Run:

```bash
npm install
```

in `client/` to rewrite `client/package-lock.json`.

**Step 5: Commit**

```bash
git add client/package.json client/package-lock.json client/vite.config.ts client/tsconfig.app.json
git rm client/src/pages/VisualizerPage.test.tsx client/src/test/setup.ts client/src/test/renderWithRouter.tsx
git commit -m "chore(client): remove test harness"
```

### Task 2: Reorganize Landing Feature

**Files:**
- Create: `client/src/features/landing/content.ts`
- Create: `client/src/features/landing/motion.ts`
- Create: `client/src/features/landing/components/HeroSection.tsx`
- Create: `client/src/features/landing/components/ServicesSection.tsx`
- Create: `client/src/features/landing/components/GallerySection.tsx`
- Create: `client/src/features/landing/components/TestimonialsSection.tsx`
- Create: `client/src/features/landing/components/BookingSection.tsx`
- Modify: `client/src/pages/LandingPage.tsx`

**Step 1: Extract static content**

Move:
- `services`
- `gallery`
- `testimonials`

into `client/src/features/landing/content.ts`.

**Step 2: Extract shared landing motion preset**

Move `sectionReveal` into `client/src/features/landing/motion.ts`.

**Step 3: Split landing sections**

Create focused section components:
- `HeroSection`
- `ServicesSection`
- `GallerySection`
- `TestimonialsSection`
- `BookingSection`

Each component should accept only the data it needs.

**Step 4: Reduce `LandingPage` to a shell**

`client/src/pages/LandingPage.tsx` should:
- import the content
- import the section components
- assemble the page only

**Step 5: Commit**

```bash
git add client/src/pages/LandingPage.tsx client/src/features/landing
git commit -m "refactor(client): split landing feature sections"
```

### Task 3: Extract Visualizer Feature Components

**Files:**
- Create: `client/src/features/visualizer/components/SelectorPanel.tsx`
- Create: `client/src/features/visualizer/components/PreviewPanel.tsx`
- Create: `client/src/features/visualizer/components/UploadCatalogModal.tsx`
- Create: `client/src/features/visualizer/components/SearchField.tsx`
- Create: `client/src/features/visualizer/components/UploadIconButton.tsx`
- Create: `client/src/features/visualizer/components/SelectorPager.tsx`
- Create: `client/src/features/visualizer/components/LoadingIndicator.tsx`
- Create: `client/src/features/visualizer/components/NoticeText.tsx`
- Modify: `client/src/components/SelectorGrid.tsx`
- Modify: `client/src/components/ImageModal.tsx`

**Step 1: Move feature-local presentational pieces out of `VisualizerPage.tsx`**

Extract:
- search field
- upload icon button
- selector pager
- loading indicator
- hint/error text helpers
- upload modal
- preview panel

**Step 2: Create a parameterized selector panel**

`SelectorPanel.tsx` should accept:
- title/label strings
- query + change handler
- upload action props
- loading/error/empty state props
- visible items
- selected id
- delete/select handlers
- pagination props

It should own only rendering, not data fetching or mutation logic.

**Step 3: Keep shared components narrow**

- `SelectorGrid.tsx` stays presentational
- `ImageModal.tsx` stays reusable, but trim any unnecessary props or local complexity if found

**Step 4: Commit**

```bash
git add client/src/components/SelectorGrid.tsx client/src/components/ImageModal.tsx client/src/features/visualizer/components
git commit -m "refactor(client): extract visualizer feature components"
```

### Task 4: Move Visualizer State Into a Focused Hook

**Files:**
- Create: `client/src/features/visualizer/hooks/useVisualizer.ts`
- Create: `client/src/features/visualizer/utils/pagination.ts`
- Create: `client/src/features/visualizer/utils/catalogState.ts` (only if needed)
- Modify: `client/src/pages/VisualizerPage.tsx`

**Step 1: Extract stateful logic from `VisualizerPage.tsx`**

Move into `useVisualizer.ts`:
- catalog arrays
- selection state
- search queries
- page state
- generated image state
- modal state
- upload form state
- upload/delete/generate handlers

**Step 2: Simplify derived values**

Keep derived values in the hook return, not stored via effects:
- selected car/wrap
- filtered arrays
- page counts
- visible items
- generate availability

Only keep effects for:
- initial catalog load
- browser event integration already required by child components

**Step 3: Extract small pure helpers**

If useful, add pure helpers for:
- visible-page slicing
- clamping page numbers
- search normalization

Do not create generic helpers unless reused.

**Step 4: Shrink `VisualizerPage.tsx`**

The page should only:
- call the visualizer hook
- render two selector panels
- render preview panel
- render upload modal
- render image modal

**Step 5: Commit**

```bash
git add client/src/pages/VisualizerPage.tsx client/src/features/visualizer/hooks client/src/features/visualizer/utils
git commit -m "refactor(client): move visualizer state into hook"
```

### Task 5: Simplify Client API and Shared Types

**Files:**
- Modify: `client/src/api/catalog.ts`
- Modify: `client/src/api/generateFromServer.ts`
- Modify: `client/src/types/catalog.ts`

**Step 1: Reduce duplication in API error handling**

Create small file-local helpers so both API modules follow the same shape for:
- parsing JSON
- reading error messages

Do not over-abstract across files unless duplication is real.

**Step 2: Re-check type placement**

Keep `client/src/types/catalog.ts` only if both API and feature components need it.
If visualizer-only types become feature-local, move them into `features/visualizer`.

**Step 3: Keep request modules small**

Target:
- one request helper per file
- one small error parser/helper
- no UI concerns in API files

**Step 4: Commit**

```bash
git add client/src/api/catalog.ts client/src/api/generateFromServer.ts client/src/types/catalog.ts
git commit -m "refactor(client): simplify client api modules"
```

### Task 6: Final Cleanup and Verification

**Files:**
- Modify: `client/src/App.tsx` if imports/paths need cleanup
- Modify: `client/src/main.tsx` only if needed
- Modify: `client/src/index.css` only if extracted components justify cleanup
- Modify: `client/eslint.config.js` only if cleanup is needed

**Step 1: Remove dead imports and stale comments**

Run through changed files and remove:
- unused imports
- obsolete helpers
- duplicated local components left behind after extraction

**Step 2: Keep config only where it pays for itself**

Do not delete core Vite/TypeScript config files.
Only simplify them if test removal or path cleanup makes them smaller.

**Step 3: Run verification**

Run in `client/`:

```bash
npm run lint
npm run build
```

Expected:
- lint passes
- build passes

**Step 4: Review diff**

Run:

```bash
git diff -- client
```

Confirm:
- test harness is gone
- page shells are smaller
- feature folders now hold most implementation detail
- config is simpler without being under-specified

**Step 5: Commit**

```bash
git add client
git commit -m "refactor(client): simplify feature structure and state ownership"
```
