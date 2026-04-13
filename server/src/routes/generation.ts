import express from "express";
import { generateWrapPreviewController } from "../controllers/generation.controller.js";
import { asyncRoute } from "../lib/http.js";

const router = express.Router();

router.post("/", asyncRoute(generateWrapPreviewController));

export default router;
