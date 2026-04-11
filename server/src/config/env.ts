import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type AppEnv = {
  port: number;
  model: string;
  apiKey: string;
  firebaseStorageBucket: string;
  shopsCollectionName: string;
  leadsCollectionName: string;
  clientDistDir: string;
};

export type LoadedEnv = {
  env: AppEnv;
  serverRoot: string;
  repoRoot: string;
};

export function createEnv(rawEnv: NodeJS.ProcessEnv, serverRoot: string): AppEnv {
  const parsedPort = Number.parseInt(rawEnv.PORT ?? "8080", 10);
  const port = Number.isFinite(parsedPort) ? parsedPort : 8080;
  const model = (rawEnv.GEMINI_MODEL ?? "gemini-2.5-flash-image").trim();
  const apiKey = (rawEnv.GEMINI_API_KEY ?? "").trim();
  const firebaseStorageBucket = (rawEnv.FIREBASE_STORAGE_BUCKET ?? "").trim();
  const shopsCollectionName = (rawEnv.SHOPS_COLLECTION ?? "shops").trim();
  const leadsCollectionName = (rawEnv.LEADS_COLLECTION ?? "leads").trim();
  if (!firebaseStorageBucket) {
    throw new Error("FIREBASE_STORAGE_BUCKET is required");
  }

  return {
    port,
    model,
    apiKey,
    firebaseStorageBucket,
    shopsCollectionName,
    leadsCollectionName,
    clientDistDir: resolveFromServer(
      serverRoot,
      rawEnv.CLIENT_DIST_DIR ?? "../client/dist",
    ),
  };
}

export function loadEnv(importMetaUrl: string): LoadedEnv {
  const __filename = fileURLToPath(importMetaUrl);
  const __dirname = path.dirname(__filename);
  const serverRoot = path.resolve(__dirname, "..");
  const repoRoot = path.resolve(serverRoot, "..");

  dotenv.config({ path: path.join(serverRoot, ".env"), quiet: true });
  dotenv.config({ path: path.join(repoRoot, ".env"), quiet: true });

  return {
    env: createEnv(process.env, serverRoot),
    serverRoot,
    repoRoot,
  };
}

function resolveFromServer(serverRoot: string, value: string): string {
  if (path.isAbsolute(value)) {
    return value;
  }
  return path.resolve(serverRoot, value);
}
