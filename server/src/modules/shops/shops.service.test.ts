import assert from "node:assert/strict";
import test from "node:test";
import { HttpError } from "../../lib/errors.js";
import { createShopsService } from "./shops.service.js";

test("getPublicShop returns an active shop", async () => {
  const service = createShopsService({
    repository: {
      async getBySlug() {
        return {
          slug: "demo",
          shopName: "Demo Wrap Shop",
          logoUrl: "",
          accentColor: "#ff7a18",
          leadEmail: "leads@example.com",
          status: "active" as const,
        };
      },
    },
  });

  const shop = await service.getPublicShop("demo");

  assert.equal(shop.slug, "demo");
  assert.equal(shop.shopName, "Demo Wrap Shop");
});

test("getPublicShop throws when the shop does not exist", async () => {
  const service = createShopsService({
    repository: {
      async getBySlug() {
        return null;
      },
    },
  });

  await assert.rejects(
    () => service.getPublicShop("missing"),
    (error: unknown) =>
      error instanceof HttpError &&
      error.status === 404 &&
      error.message === "shop not found",
  );
});

test("getPublicShop throws when the shop is inactive", async () => {
  const service = createShopsService({
    repository: {
      async getBySlug() {
        return {
          slug: "demo",
          shopName: "Demo Wrap Shop",
          logoUrl: "",
          accentColor: "#ff7a18",
          leadEmail: "leads@example.com",
          status: "suspended" as const,
        };
      },
    },
  });

  await assert.rejects(
    () => service.getPublicShop("demo"),
    (error: unknown) =>
      error instanceof HttpError &&
      error.status === 403 &&
      error.message === "shop is inactive",
  );
});
