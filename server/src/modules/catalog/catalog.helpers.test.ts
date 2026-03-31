import assert from "node:assert/strict";
import test from "node:test";
import {
  extensionFromUpload,
  normalizeMimeType,
  parseCatalogKind,
  sanitizeCatalogFileName,
  slugify,
} from "./catalog.helpers.js";

test("slugify normalizes labels into stable ids", () => {
  assert.equal(slugify(" BMW   M3 Competition "), "bmw-m3-competition");
});

test("extensionFromUpload falls back to the uploaded file extension when needed", () => {
  assert.equal(extensionFromUpload("render.jpeg", "application/octet-stream"), ".jpg");
  assert.equal(extensionFromUpload("render.png", "image/png"), ".png");
});

test("normalizeMimeType canonicalizes supported image mimes", () => {
  assert.equal(normalizeMimeType("image/jpg", ".jpg"), "image/jpeg");
  assert.equal(normalizeMimeType("invalid/type", ".webp"), "image/webp");
});

test("parseCatalogKind and sanitizeCatalogFileName reject invalid input", () => {
  assert.equal(parseCatalogKind("WRAPS"), "wraps");
  assert.equal(parseCatalogKind("boats"), null);
  assert.equal(sanitizeCatalogFileName("tesla-model-3.png"), "tesla-model-3.png");
  assert.equal(sanitizeCatalogFileName("../tesla-model-3.png"), null);
});
