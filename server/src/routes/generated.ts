import express from "express";
import { getGeneratedImageController } from "../controllers/generation.controller.js";
import { asyncRoute } from "../lib/http.js";

const router = express.Router();

router.get("/:fileName", asyncRoute(getGeneratedImageController));

export default router;
