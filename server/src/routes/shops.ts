import express from "express";
import { getPublicShopController } from "../controllers/shops.controller.js";
import { asyncRoute } from "../lib/http.js";

const router = express.Router();

router.get("/:slug", asyncRoute(getPublicShopController));

export default router;
