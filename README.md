# Car Wrap Visualizer

Simple React + TypeScript frontend for selecting:
- 1 car image (from 10 options)
- 1 wrap image/color (from 10 options)

Then clicking **Generate** to call a mocked client that returns a placeholder generated result image.

No backend/server is used in this version.

## Tech

- React + TypeScript
- Vite
- Vitest + Testing Library

## Run

```bash
npm install
npm run dev
```

## Test

```bash
npm run test -- --run
```

## Build

```bash
npm run build
```

## Asset Folders

- `public/cars`
- `public/wraps`
- `public/generated`

The project currently includes placeholder files so the UI renders immediately.
Replace them with your real images using the same filenames.

### Expected Car Files

- `toyota-camry.jpg`
- `honda-civic.jpg`
- `tesla-model-3.jpg`
- `ford-f150.jpg`
- `chevy-silverado.avif`
- `bmw-m3.jpg`
- `jeep-wrangler.jpeg`
- `toyota-rav4.jpg`
- `ford-mustang.jpg`
- `tesla-model-y.jpg`

### Expected Wrap Files

- `diamond-blue-red-shift.jpg`
- `diamond-northern-lights.jpg`
- `iridescent-black.jpg`
- `metallic-isle-of-man-green.jpg`
- `metallic-gold-green-shift.jpg`
- `nebula-red-purple.jpg`
- `midnight-violet.jpg`
- `iridescent-silver.jpg`
- `metallic-orange-red.jpg`
- `tropical-chrome.jpg`

### Expected Generated Placeholder

- `public/generated/mock-result.jpg`

## Mock API Behavior

`src/api/generateMock.ts` simulates async generation:
- waits ~800ms
- returns `/generated/mock-result.jpg` and a prompt string
- can throw an error when `forceError: true`
