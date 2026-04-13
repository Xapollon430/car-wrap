import express from "express";
import { saveLeadImageController } from "../controllers/leads.controller.js";
import { asyncRoute } from "../lib/http.js";

const router = express.Router();

router.post("/save-image", asyncRoute(saveLeadImageController));

export default router;
