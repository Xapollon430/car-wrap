import type { NextFunction, Request, Response } from "express";
import { badRequest, notFound } from "../lib/errors.js";
import { sendStreamFile } from "../lib/http.js";
import { generateWrapPreview } from "../services/generation.service.js";
import {
  getGeneratedImageFile,
  sanitizeGeneratedFileName,
} from "../services/generated-image.service.js";

export async function generateWrapPreviewController(req: Request, res: Response) {
  const carName = readString(req.body, "carName");
  const wrapName = readString(req.body, "wrapName");
  if (!carName || !wrapName) {
    throw badRequest("carName and wrapName are required");
  }

  res.json(await generateWrapPreview({ carName, wrapName }));
}

export async function getGeneratedImageController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const fileName = sanitizeGeneratedFileName(readParam(req.params.fileName));
  if (!fileName) {
    throw badRequest("invalid generated image name");
  }

  const file = await getGeneratedImageFile(fileName);
  if (!file) {
    throw notFound("file not found");
  }

  sendStreamFile(file, res, next);
}

function readString(body: unknown, fieldName: string): string {
  if (!body || typeof body !== "object") {
    return "";
  }

  const value = (body as Record<string, unknown>)[fieldName];
  return typeof value === "string" ? value.trim() : "";
}

function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
