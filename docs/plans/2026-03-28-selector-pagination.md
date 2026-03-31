# Selector Pagination Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add fixed 4-item frontend pagination for the Cars and Wraps selectors while preserving search behavior and showing inline loading spinners in both selector panels.

**Architecture:** Keep filtering and pagination state in `client/src/pages/VisualizerPage.tsx` so each selector panel can page independently without expanding `SelectorGrid` into a stateful controller. Add a lightweight client test harness with Vitest and React Testing Library, mock catalog loading, and keep the selector grid focused on rendering the visible slice plus optional motion wrappers and pager UI nearby.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, React Testing Library, Framer Motion, Tailwind CSS

---

Execution guidance:
- Use `@test-driven-development` for each behavior change.
- Use `@systematic-debugging` for unexpected failures.
- Use `@verification-before-completion` before completion claims.

### Task 1: Add Client Test Harness

**Files:**
- Modify: `client/package.json`
- Modify: `client/vite.config.ts`
- Create: `client/src/test/setup.ts`
- Create: `client/src/test/renderWithRouter.tsx`

**Step 1: Install the failing-test toolchain**

Run:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Step 2: Add test script and config**

- add a `test` script in `client/package.json`
- add `test.environment = "jsdom"` and `setupFiles` config in `client/vite.config.ts`

**Step 3: Add shared test setup**

Create `client/src/test/setup.ts` to load `@testing-library/jest-dom` and clear mocks after each test.

**Step 4: Add shared render helper**

Create `client/src/test/renderWithRouter.tsx` so route-based pages can render in a memory router.

**Step 5: Run the empty harness once**

Run: `npm test -- --run`
Expected: PASS with 0 test files or no failures after setup is accepted by Vitest.

### Task 2: Add Failing Pagination and Loading Tests

**Files:**
- Create: `client/src/pages/VisualizerPage.test.tsx`
- Read: `client/src/pages/VisualizerPage.tsx`
- Read: `client/src/api/catalog.ts`

**Step 1: Write failing loading test**

Add a test that mocks a pending `fetchCatalog` promise and asserts:

```tsx
expect(screen.getByLabelText(/loading cars/i)).toBeInTheDocument()
expect(screen.getByLabelText(/loading wraps/i)).toBeInTheDocument()
```

**Step 2: Write failing pagination test**

Mock a catalog with more than 4 cars and wraps, render the page, and assert:

```tsx
expect(screen.getAllByRole('button', { name: /select car/i })).toHaveLength(4)
expect(screen.getByRole('button', { name: /next cars page/i })).toBeEnabled()
```

**Step 3: Write failing search reset test**

Assert that after moving to page 2, typing a query resets the cars panel to page 1 and still shows only 4 matching items.

**Step 4: Run the page test file to verify RED**

Run: `npm test -- --run client/src/pages/VisualizerPage.test.tsx`
Expected: FAIL because loading spinners, pager controls, and paged slicing are not implemented yet.

### Task 3: Implement Search-Aware Pagination and Loading Spinners

**Files:**
- Modify: `client/src/pages/VisualizerPage.tsx`
- Modify: `client/src/components/SelectorGrid.tsx`

**Step 1: Add page state and page-size constant**

In `VisualizerPage.tsx`, add:

```tsx
const PAGE_SIZE = 4
const [carPage, setCarPage] = useState(1)
const [wrapPage, setWrapPage] = useState(1)
```

**Step 2: Derive page counts and visible slices**

Compute:
- `carPageCount`
- `wrapPageCount`
- `visibleCars`
- `visibleWraps`

based on filtered arrays and current page.

**Step 3: Reset and clamp pages**

- reset `carPage` when `carSearchQuery` changes
- reset `wrapPage` when `wrapSearchQuery` changes
- clamp both pages when catalog size changes after upload, delete, or filter updates

**Step 4: Add inline loading indicators**

Replace selector-panel loading copy with a compact spinner + status row in each panel.

**Step 5: Add pager footer UI**

Render panel-local previous and next buttons plus page position text below each grid.

**Step 6: Expose clearer selector button names**

Update `SelectorGrid.tsx` button labels or `aria-label`s so tests and assistive tech can distinguish car and wrap item selection cleanly.

**Step 7: Run the feature test file**

Run: `npm test -- --run client/src/pages/VisualizerPage.test.tsx`
Expected: PASS.

### Task 4: Refine Motion and Finish Verification

**Files:**
- Modify: `client/src/pages/VisualizerPage.tsx`
- Modify: `client/src/index.css`

**Step 1: Add restrained page-transition motion**

Wrap the selector grid area in a small `framer-motion` transition that fades/slides on page changes.

**Step 2: Polish spinner and pager styling**

Add utility classes or small CSS helpers only if the current Tailwind classes are not enough.

**Step 3: Run full verification**

Run:

```bash
npm test -- --run
npm run lint
npm run build
```

Expected:
- tests pass
- lint passes
- build passes

**Step 4: Review git diff**

Run:

```bash
git diff -- client
```

Confirm the change is scoped to client files and the new docs.
