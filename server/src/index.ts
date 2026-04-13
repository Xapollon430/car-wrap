import dotenv from "dotenv";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import catalogMediaRouter from "./routes/catalog-media.js";
import catalogRouter from "./routes/catalog.js";
import generatedRouter from "./routes/generated.js";
import generationRouter from "./routes/generation.js";
import leadsRouter from "./routes/leads.js";
import shopsRouter from "./routes/shops.js";
import { messageFromError } from "./lib/errors.js";
import { pathExists } from "./lib/files.js";
import { errorMiddleware } from "./lib/http.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(serverRoot, "..");

dotenv.config({ path: path.join(serverRoot, ".env"), quiet: true });
dotenv.config({ path: path.join(repoRoot, ".env"), quiet: true });

async function main(): Promise<void> {
  const parsedPort = Number.parseInt(process.env.PORT ?? "8080", 10);
  const port = Number.isFinite(parsedPort) ? parsedPort : 8080;
  const model =
    (process.env.GEMINI_MODEL ?? "gemini-2.5-flash-image").trim() ||
    "gemini-2.5-flash-image";
  const firebaseStorageBucket = (process.env.FIREBASE_STORAGE_BUCKET ?? "").trim();
  if (!firebaseStorageBucket) {
    throw new Error("FIREBASE_STORAGE_BUCKET is required");
  }

  const clientDistDir = resolveFromServer(
    serverRoot,
    process.env.CLIENT_DIST_DIR ?? "../client/dist",
  );

  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.get("/healthz", (_req, res) => {
    res.type("text/plain").send("ok");
  });

  app.use("/api/catalog", catalogRouter);
  app.use("/api/generate", generationRouter);
  app.use("/api/leads", leadsRouter);
  app.use("/api/shops", shopsRouter);
  app.use("/generated", generatedRouter);
  app.use("/catalog-media", catalogMediaRouter);

  const clientIndexPath = path.join(clientDistDir, "index.html");
  const hasClientBuild = await pathExists(clientIndexPath);

  if (hasClientBuild) {
    app.use(express.static(clientDistDir));

    app.get(/.*/, (req, res, next) => {
      if (isServerRoute(req.path)) {
        next();
        return;
      }

      res.sendFile(clientIndexPath);
    });
  } else {
    console.warn(
      `client build not found at ${clientIndexPath}; API routes still available`,
    );
  }

  app.use(errorMiddleware);

  app.listen(port, () => {
    console.log(
      `server listening on :${port} (model=${model}, bucket=${firebaseStorageBucket})`,
    );
  });
}

void main().catch((error) => {
  console.error(messageFromError(error, "server failed to start"));
  process.exit(1);
});

function resolveFromServer(serverRootPath: string, value: string): string {
  if (path.isAbsolute(value)) {
    return value;
  }

  return path.resolve(serverRootPath, value);
}

function isServerRoute(pathname: string): boolean {
  return (
    pathname === "/healthz" ||
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname === "/generated" ||
    pathname.startsWith("/generated/") ||
    pathname === "/catalog-media" ||
    pathname.startsWith("/catalog-media/")
  );
}
