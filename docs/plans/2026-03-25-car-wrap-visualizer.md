# Car Wrap Visualizer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a React + TypeScript frontend where users select 1 of 10 cars and 1 of 10 wraps, click `Generate`, and see a mocked generated image result.

**Architecture:** Use a Vite React TypeScript app with static assets in `public/`, hardcoded manifest data in `src/data`, a mocked async generator in `src/api`, and a single-page orchestration flow in `src/App.tsx`. Keep logic simple and local-state driven, while separating selectors/result into small components for readability.

**Tech Stack:** React, TypeScript, Vite, Vitest, React Testing Library, CSS

---

Execution guidance for the implementer:
- Use `@test-driven-development` for all feature tasks.
- Use `@systematic-debugging` if any test fails unexpectedly.
- Use `@verification-before-completion` before reporting done.

### Task 1: Scaffold React + TypeScript + Test Tooling

**Files:**
- Create: `package.json` (via scaffold)
- Create: `index.html` (via scaffold)
- Create: `src/main.tsx` (via scaffold)
- Create: `src/App.tsx` (via scaffold, temporary)
- Create: `src/setupTests.ts`
- Modify: `vite.config.ts`
- Modify: `tsconfig.json`

**Step 1: Scaffold the app**

Run: `npm create vite@latest . -- --template react-ts`
Expected: Vite scaffold files created.

**Step 2: Install test dependencies**

Run: `npm install && npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`
Expected: install completes with no errors.

**Step 3: Configure Vitest environment**

Add this to `vite.config.ts`:

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
  },
})
```

Create `src/setupTests.ts`:

```ts
import '@testing-library/jest-dom'
```

**Step 4: Add a smoke test**

Create `src/App.smoke.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import App from './App'

test('renders app title', () => {
  render(<App />)
  expect(screen.getByText(/car wrap visualizer/i)).toBeInTheDocument()
})
```

**Step 5: Run test and verify pass**

Run: `npm run test -- --run src/App.smoke.test.tsx`
Expected: PASS.

**Step 6: Commit**

```bash
git add .
git commit -m "chore: scaffold react ts app with vitest setup"
```

### Task 2: Add Typed Manifests for Cars and Wraps

**Files:**
- Create: `src/types/catalog.ts`
- Create: `src/data/cars.ts`
- Create: `src/data/wraps.ts`
- Test: `src/data/catalog.test.ts`

**Step 1: Write failing test**

Create `src/data/catalog.test.ts`:

```ts
import { cars } from './cars'
import { wraps } from './wraps'

test('cars manifest has 10 items', () => {
  expect(cars).toHaveLength(10)
})

test('wraps manifest has 10 items', () => {
  expect(wraps).toHaveLength(10)
})

test('every item has id label and imagePath', () => {
  for (const item of [...cars, ...wraps]) {
    expect(item.id).toBeTruthy()
    expect(item.label).toBeTruthy()
    expect(item.imagePath.startsWith('/')).toBe(true)
  }
})
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- --run src/data/catalog.test.ts`
Expected: FAIL (`cannot find module` files).

**Step 3: Write minimal implementation**

Create `src/types/catalog.ts`:

```ts
export type CatalogItem = {
  id: string
  label: string
  imagePath: string
}
```

Create `src/data/cars.ts` and `src/data/wraps.ts` with 10 hardcoded items each:

```ts
import type { CatalogItem } from '../types/catalog'

export const cars: CatalogItem[] = [
  { id: 'car-1', label: 'Toyota Camry', imagePath: '/cars/toyota-camry.jpg' },
  // ... total 10 items
]
```

```ts
import type { CatalogItem } from '../types/catalog'

export const wraps: CatalogItem[] = [
  { id: 'wrap-1', label: 'Gloss Black', imagePath: '/wraps/gloss-black.jpg' },
  // ... total 10 items
]
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- --run src/data/catalog.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/types/catalog.ts src/data/cars.ts src/data/wraps.ts src/data/catalog.test.ts
git commit -m "feat: add typed hardcoded car and wrap manifests"
```

### Task 3: Build Mock Generate API

**Files:**
- Create: `src/api/generateMock.ts`
- Test: `src/api/generateMock.test.ts`

**Step 1: Write failing tests**

Create `src/api/generateMock.test.ts`:

```ts
import { generateMock } from './generateMock'

test('returns generated image URL on success', async () => {
  const result = await generateMock({
    carLabel: 'Toyota Camry',
    wrapLabel: 'Gloss Black',
  })
  expect(result.imageUrl).toMatch(/^\/generated\//)
  expect(result.prompt).toContain('Toyota Camry')
  expect(result.prompt).toContain('Gloss Black')
})

test('throws when forceError is true', async () => {
  await expect(
    generateMock({ carLabel: 'A', wrapLabel: 'B', forceError: true }),
  ).rejects.toThrow(/could not generate/i)
})
```

**Step 2: Run test to verify failure**

Run: `npm run test -- --run src/api/generateMock.test.ts`
Expected: FAIL (`cannot find module './generateMock'`).

**Step 3: Write minimal implementation**

Create `src/api/generateMock.ts`:

```ts
export type GenerateInput = {
  carLabel: string
  wrapLabel: string
  forceError?: boolean
}

export type GenerateResult = {
  imageUrl: string
  prompt: string
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function generateMock(input: GenerateInput): Promise<GenerateResult> {
  await sleep(1000)

  if (input.forceError) {
    throw new Error('Could not generate image')
  }

  return {
    imageUrl: '/generated/mock-result.jpg',
    prompt: `Generate ${input.carLabel} with ${input.wrapLabel} wrap`,
  }
}
```

**Step 4: Run test to verify pass**

Run: `npm run test -- --run src/api/generateMock.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/api/generateMock.ts src/api/generateMock.test.ts
git commit -m "feat: add mocked generate API"
```

### Task 4: Implement Selection UI and Button Enable Rules

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/SelectorGrid.tsx`
- Test: `src/App.selection.test.tsx`
- Modify: `src/App.css`

**Step 1: Write failing component test**

Create `src/App.selection.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

test('generate is disabled until car and wrap are selected', async () => {
  const user = userEvent.setup()
  render(<App />)

  const button = screen.getByRole('button', { name: /generate/i })
  expect(button).toBeDisabled()

  await user.click(screen.getByRole('button', { name: /toyota camry/i }))
  expect(button).toBeDisabled()
})
```

**Step 2: Run test to verify fail**

Run: `npm run test -- --run src/App.selection.test.tsx`
Expected: FAIL (selector UI not present yet).

**Step 3: Implement minimal UI**

- Render title `Car Wrap Visualizer`
- Render two grids (cars, wraps) with button-style cards
- Track selected IDs in local state
- Disable generate button unless both IDs exist

Example card button:

```tsx
<button
  type="button"
  aria-pressed={selected}
  onClick={() => onSelect(item.id)}
>
  <img src={item.imagePath} alt={item.label} />
  <span>{item.label}</span>
</button>
```

**Step 4: Run test to verify pass**

Run: `npm run test -- --run src/App.selection.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/App.tsx src/components/SelectorGrid.tsx src/App.css src/App.selection.test.tsx
git commit -m "feat: add car and wrap selection UI with button state rules"
```

### Task 5: Implement Generate Flow, Loading, Result, and Error

**Files:**
- Modify: `src/App.tsx`
- Test: `src/App.generate.test.tsx`

**Step 1: Write failing test for success path**

Create `src/App.generate.test.tsx` with mock:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import * as api from './api/generateMock'

test('shows generated image after clicking generate', async () => {
  vi.spyOn(api, 'generateMock').mockResolvedValue({
    imageUrl: '/generated/mock-result.jpg',
    prompt: 'x',
  })

  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('button', { name: /toyota camry/i }))
  await user.click(screen.getByRole('button', { name: /gloss black/i }))
  await user.click(screen.getByRole('button', { name: /generate/i }))

  expect(await screen.findByAltText(/generated result/i)).toBeInTheDocument()
})
```

**Step 2: Write failing test for error path**

Add:

```tsx
test('shows error message when generation fails', async () => {
  vi.spyOn(api, 'generateMock').mockRejectedValue(new Error('Could not generate image'))

  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('button', { name: /toyota camry/i }))
  await user.click(screen.getByRole('button', { name: /gloss black/i }))
  await user.click(screen.getByRole('button', { name: /generate/i }))

  expect(await screen.findByText(/couldn.t generate image/i)).toBeInTheDocument()
})
```

**Step 3: Run tests to verify fail**

Run: `npm run test -- --run src/App.generate.test.tsx`
Expected: FAIL (generate flow not implemented).

**Step 4: Implement minimal generate flow**

- Add `isGenerating`, `generatedImageUrl`, `errorMessage`
- Call `generateMock` on button click
- Show loading text while waiting
- Show generated image on success
- Show inline error on failure

**Step 5: Run tests to verify pass**

Run: `npm run test -- --run src/App.generate.test.tsx`
Expected: PASS.

**Step 6: Commit**

```bash
git add src/App.tsx src/App.generate.test.tsx
git commit -m "feat: add mocked generate flow with loading success and error states"
```

### Task 6: Polish Layout, Accessibility, and Manual QA

**Files:**
- Modify: `src/App.css`
- Modify: `src/App.tsx`
- Modify: `README.md`

**Step 1: Write failing accessibility test**

Add to `src/App.selection.test.tsx`:

```tsx
test('selection controls and generated image region have accessible labels', () => {
  render(<App />)
  expect(screen.getByRole('region', { name: /car options/i })).toBeInTheDocument()
  expect(screen.getByRole('region', { name: /wrap options/i })).toBeInTheDocument()
  expect(screen.getByRole('region', { name: /result preview/i })).toBeInTheDocument()
})
```

**Step 2: Run test to verify fail**

Run: `npm run test -- --run src/App.selection.test.tsx`
Expected: FAIL if ARIA landmarks are missing.

**Step 3: Implement accessibility + responsive polish**

- Add ARIA labels/regions for car list, wrap list, and result panel
- Add visible focus styles
- Add mobile breakpoint (`max-width: 900px`) to stack sections
- Keep contrast strong for selected state and primary button

**Step 4: Run full test suite**

Run: `npm run test -- --run`
Expected: all tests PASS.

**Step 5: Manual QA checklist**

Run:
- `npm run dev`
- Verify all 10 car options render
- Verify all 10 wrap options render
- Verify generate disabled until both selected
- Verify loading indicator appears during generate
- Verify generated image appears
- Verify error message appears when API mock is forced to fail

**Step 6: Update README and commit**

In `README.md`, document:
- required asset folders and expected file names
- how to run app and tests
- known placeholder limitation of mock API

Commit:

```bash
git add src/App.tsx src/App.css src/App.selection.test.tsx README.md
git commit -m "chore: improve accessibility responsive polish and docs"
```

