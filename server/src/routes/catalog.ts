import express from "express";
import { asyncRoute } from "../lib/http.js";
import {
  commitCatalogItemController,
  createCatalogUploadController,
  deleteCatalogItemController,
  getCatalogController,
} from "../controllers/catalog.controller.js";

const router = express.Router();

router.get("/", asyncRoute(getCatalogController));
router.post("/:kind/upload-url", asyncRoute(createCatalogUploadController));
router.post("/:kind/commit", asyncRoute(commitCatalogItemController));
router.delete("/:kind/:id", asyncRoute(deleteCatalogItemController));

export default router;
