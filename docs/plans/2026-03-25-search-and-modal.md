# Searchable Selectors and Preview Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add separate search for cars and wraps, plus a maximize action that opens the generated image in a large closable modal.

**Architecture:** Keep filtering and modal-open state in `App.tsx` and pass filtered arrays into the existing `SelectorGrid`. Introduce a focused `ImageModal` component for dialog semantics and close behavior (button, backdrop, and `Esc`). Extend existing Vitest/RTL suites with behavior-first tests before implementation changes.

**Tech Stack:** React, TypeScript, Vite, Vitest, React Testing Library, CSS

---

Execution guidance:
- Use `@test-driven-development` for each task.
- Use `@systematic-debugging` for unexpected red/green failures.
- Use `@verification-before-completion` before completion claims.

### Task 1: Add Search Behavior Tests (RED)

**Files:**
- Modify: `src/App.selection.test.tsx`
- Read: `src/data/cars.ts`
- Read: `src/data/wraps.ts`

**Step 1: Write failing search tests**

Add tests in `src/App.selection.test.tsx`:

```tsx
test('filters cars by search query', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByLabelText(/search cars/i), 'mustang')
  expect(screen.getByRole('button', { name: /ford mustang gt/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /toyota camry/i })).not.toBeInTheDocument()
})

test('shows empty state when no wraps match search', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByLabelText(/search wraps/i), 'zzzzz')
  expect(screen.getByText(/no wraps match/i)).toBeInTheDocument()
})
```

**Step 2: Run tests to verify they fail**

Run: `npm run test -- --run src/App.selection.test.tsx`
Expected: FAIL because search inputs and empty-state copy do not exist yet.

**Step 3: Commit test-only red state (optional if your flow commits red tests)**

```bash
git add src/App.selection.test.tsx
git commit -m "test: add failing selector search behavior coverage"
```

### Task 2: Implement Search Inputs and Filtered Lists (GREEN)

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css`

**Step 1: Add search state and filtered arrays**

In `App.tsx`, add:

```tsx
const [carSearchQuery, setCarSearchQuery] = useState('')
const [wrapSearchQuery, setWrapSearchQuery] = useState('')

const filteredCars = useMemo(
  () => cars.filter((car) => car.label.toLowerCase().includes(carSearchQuery.toLowerCase().trim())),
  [carSearchQuery],
)
const filteredWraps = useMemo(
  () => wraps.filter((wrap) => wrap.label.toLowerCase().includes(wrapSearchQuery.toLowerCase().trim())),
  [wrapSearchQuery],
)
```

**Step 2: Render two labeled search inputs**

Before each selector grid:

```tsx
<label htmlFor="car-search" className="search-label">Search cars</label>
<input id="car-search" value={carSearchQuery} onChange={(e) => setCarSearchQuery(e.target.value)} />
```

Repeat for wraps with `wrap-search`.

**Step 3: Pass filtered arrays to `SelectorGrid` and add empty-state copy**

```tsx
{filteredCars.length ? (
  <SelectorGrid items={filteredCars} ... />
) : (
  <p className="hint">No cars match "{carSearchQuery}".</p>
)}
```

Repeat for wraps.

**Step 4: Style search controls**

In `src/App.css`, add classes for:
- `.search-label`
- `.search-input`
- optional `.search-group`

Ensure focus styles are visible and match existing visual language.

**Step 5: Run selector tests**

Run: `npm run test -- --run src/App.selection.test.tsx`
Expected: PASS.

**Step 6: Commit**

```bash
git add src/App.tsx src/App.css src/App.selection.test.tsx
git commit -m "feat: add searchable car and wrap selectors"
```

### Task 3: Add Modal Interaction Tests (RED)

**Files:**
- Modify: `src/App.generate.test.tsx`

**Step 1: Write failing modal tests**

Add tests:

```tsx
test('opens modal when maximize is clicked after generation', async () => {
  // generate success setup
  // click Maximize
  expect(await screen.findByRole('dialog', { name: /generated preview/i })).toBeInTheDocument()
})

test('closes modal on esc key', async () => {
  // open modal
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog', { name: /generated preview/i })).not.toBeInTheDocument()
})
```

Add one close-path test for backdrop click or close button (at least one if suite size needs control).

**Step 2: Run tests to verify fail**

Run: `npm run test -- --run src/App.generate.test.tsx`
Expected: FAIL because maximize button and dialog do not exist.

**Step 3: Commit test red state (optional)**

```bash
git add src/App.generate.test.tsx
git commit -m "test: add failing modal interaction coverage"
```

### Task 4: Implement Maximize Button and Image Modal (GREEN)

**Files:**
- Create: `src/components/ImageModal.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`

**Step 1: Create `ImageModal` component**

Component contract:

```tsx
type ImageModalProps = {
  isOpen: boolean
  imageUrl: string
  caption?: string | null
  onClose: () => void
}
```

Behavior:
- return `null` if `!isOpen`
- backdrop click closes
- dialog surface click does not close (stop propagation)
- `useEffect` keydown listener closes on `Escape`
- `role="dialog"`, `aria-modal="true"`, heading for accessible name

**Step 2: Add modal state and maximize trigger in `App.tsx`**

Add:

```tsx
const [isModalOpen, setIsModalOpen] = useState(false)
```

In generated image section:
- render `Maximize` button only when `generatedImageUrl` exists
- click sets `isModalOpen` true
- render `<ImageModal ... onClose={() => setIsModalOpen(false)} />`

**Step 3: Style modal and maximize button**

Add CSS for:
- `.maximize-button`
- `.modal-backdrop`
- `.modal-dialog`
- `.modal-close`
- responsive modal sizing (`max-width`, `max-height`)

**Step 4: Run generate tests**

Run: `npm run test -- --run src/App.generate.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/ImageModal.tsx src/App.tsx src/App.css src/App.generate.test.tsx
git commit -m "feat: add generated image maximize modal"
```

### Task 5: Full Regression Verification and Docs Touch-Up

**Files:**
- Modify: `README.md` (mention searchable selectors + modal behavior)

**Step 1: Update README**

Add short notes for:
- separate search boxes
- modal close methods (`Esc`, backdrop, close button)

**Step 2: Run full tests**

Run: `npm run test -- --run`
Expected: PASS.

**Step 3: Run build and lint**

Run: `npm run build`
Expected: PASS.

Run: `npm run lint`
Expected: PASS.

**Step 4: Commit**

```bash
git add README.md
git commit -m "docs: document selector search and image modal controls"
```
