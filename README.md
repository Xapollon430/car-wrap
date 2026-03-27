# Car Wrap Visualizer Monorepo

This repository now has:
- `client/` - React + TypeScript UI
- `client/public/` - static UI assets for landing/gallery
- `server/` - TypeScript API for Gemini image generation
- `shared/` - kept in repo but not used for runtime catalog anymore

## Generation Flow

1. UI sends `POST /api/generate` with `carName` and `wrapName`
2. Server resolves names via catalog JSON stored in Firebase Storage
3. Server loads car/wrap source images from Firebase Storage
4. Server checks Firebase Storage for existing combo cache:
   - `generated/<car-slug>__<wrap-slug>.<ext>`
5. If found, server returns cached image URL (`/generated/...`)
6. If not found, server calls Gemini, uploads result to Firebase Storage, then returns URL

## Catalog Upload Flow

- `GET /api/catalog` returns cars/wraps from Firebase Storage
- `POST /api/catalog/cars/upload-url` with JSON:
  - `name`
  - `fileName`
  - `contentType`
- Browser uploads file directly to Firebase Storage using returned signed URL
- `POST /api/catalog/cars/commit` with JSON:
  - `name`
  - `fileName`
  - `mimeType`
- Same flow for wraps:
  - `/api/catalog/wraps/upload-url`
  - `/api/catalog/wraps/commit`
- Uploaded files are stored in Firebase Storage under:
  - `cars/<slug>.<ext>`
  - `wraps/<slug>.<ext>`
- Catalog metadata is stored in bucket JSON files:
  - `catalog/cars.json`
  - `catalog/wraps.json`

## Required Environment

Copy and edit:

```bash
cp server/.env.example server/.env
```

Set:
- `GEMINI_API_KEY` to your real key
- `FIREBASE_STORAGE_BUCKET` to your Firebase Storage bucket name
- optional `GEMINI_MODEL` (default `gemini-2.5-flash-image`)
- optional `PORT` (default `8080`)
- optional `CLIENT_DIST_DIR` (default `../client/dist`)

For local development, also authenticate Google Cloud credentials so the server can read/write Firebase Storage:

```bash
gcloud auth application-default login
```

For direct browser uploads to signed URLs, configure CORS on the bucket for your app origins.
Also ensure the server identity that creates signed URLs has `iam.serviceAccounts.signBlob`
permission (for example via `roles/iam.serviceAccountTokenCreator`).

## Run Server

```bash
cd server
npm install
npm run dev
```

## Run Client

```bash
cd client
npm install
npm run dev
```

Client dev server proxies:
- `/api/*` -> `http://localhost:8080`
- `/generated/*` -> `http://localhost:8080`
- `/catalog-media/*` -> `http://localhost:8080`

## Docker (Single Container)

This repo includes a root `Dockerfile` that:
- builds the React app (`client/dist`)
- runs the TypeScript API server
- serves both UI and API from one Cloud Run service

Build and run locally:

```bash
docker build -t car-wrap .
docker run --rm -p 8080:8080 \
  -e GEMINI_API_KEY=your_key \
  -e FIREBASE_STORAGE_BUCKET=your_bucket_name \
  car-wrap
```

## Deploy to Cloud Run

1. Build and push container:

```bash
gcloud builds submit --tag gcr.io/$PROJECT_ID/car-wrap:latest
```

2. Store Gemini key in Secret Manager:

```bash
echo -n "YOUR_GEMINI_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-
# If secret already exists:
# echo -n "YOUR_GEMINI_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
```

3. Deploy:

```bash
gcloud run deploy car-wrap \
  --image gcr.io/$PROJECT_ID/car-wrap:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars FIREBASE_STORAGE_BUCKET=your_bucket_name,GEMINI_MODEL=gemini-2.5-flash-image,CLIENT_DIST_DIR=./client/dist \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

4. Grant bucket access to your Cloud Run service account:
- `roles/storage.objectAdmin` on the Firebase Storage bucket (read/write generated images)
