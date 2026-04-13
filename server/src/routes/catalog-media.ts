import express from "express";
import { getCatalogMediaController } from "../controllers/catalog.controller.js";
import { asyncRoute } from "../lib/http.js";

const router = express.Router();

router.get("/:kind/:fileName", asyncRoute(getCatalogMediaController));

export default router;
