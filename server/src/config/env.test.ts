import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { createEnv } from "./env.js";

test("createEnv applies defaults and resolves client dist from server root", () => {
  const env = createEnv(
    {
      FIREBASE_STORAGE_BUCKET: "car-wrap-test-bucket",
    },
    "/repo/server",
  );

  assert.equal(env.port, 8080);
  assert.equal(env.model, "gemini-2.5-flash-image");
  assert.equal(env.apiKey, "");
  assert.equal(env.firebaseStorageBucket, "car-wrap-test-bucket");
  assert.equal(env.shopsCollectionName, "shops");
  assert.equal(env.clientDistDir, path.resolve("/repo/server", "../client/dist"));
});

test("createEnv throws when FIREBASE_STORAGE_BUCKET is missing", () => {
  assert.throws(
    () => createEnv({}, "/repo/server"),
    /FIREBASE_STORAGE_BUCKET is required/,
  );
});
